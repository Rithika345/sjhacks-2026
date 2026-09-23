import json
import logging
from datetime import datetime, timezone

import httpx
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session

import config
from auth import create_session_token
from db import Base, engine, get_db
from deps import get_current_user
from models import Analysis, SandboxSession, User, VaultEntry
from ratelimit import rate_limit
from routers.interpret import interpret_footprint, interpret_mirror, interpret_sandbox, sandbox_conversation
from routers.processing import process_videos
from routers.vault import build_proof, check_similarity, extract_concepts
from schemas import ProfileSwitchRequest, SandboxChatRequest, SandboxRequest, VaultRequest

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger("fifth_postulate")


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Claude/Google API calls (Anthropic auth errors, network hiccups) or any
    # other unexpected failure previously surfaced as a raw 500 HTML page.
    # Log the real error server-side, return a clean JSON shape the frontend
    # already knows how to handle (it checks `data.error` everywhere).
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    response = JSONResponse(status_code=500, content={"error": "something went wrong on our end"})

    # CORSMiddleware never sees this response: Starlette's ServerErrorMiddleware
    # (which routes to app.exception_handler(Exception)) sits OUTSIDE the
    # user-added middleware stack, so a response built here bypasses
    # CORSMiddleware entirely. Without the header below, a browser on a
    # different origin (Netlify calling Cloud Run) can't read this response at
    # all -- it sees an opaque "Failed to fetch" instead of the clean error
    # message this handler exists to provide. Mirror CORSMiddleware's own
    # allow-list check by hand for this one response.
    origin = request.headers.get("origin")
    if origin in config.ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Vary"] = "Origin"
    return response

PROFILES = {
    "maya": {
        "name": "Maya's Kitchen",
        "mock_file": "mock_videos.json",
        "consumption": {
            "liked_video_count": 42,
            "liked_topics": ["cooking", "travel", "lifestyle", "food science", "photography"],
            "subscriptions": ["Gordon Ramsay", "Bon Appetit", "Joshua Weissman", "Binging with Babish", "Emma Chamberlain", "Casey Neistat", "Peter McKinnon"],
        }
    },
    "gamerz": {
        "name": "GamerzHub",
        "mock_file": "mock_videos_gamerz.json",
        "consumption": {
            "liked_video_count": 85,
            "liked_topics": ["gaming", "tech reviews", "anime", "music", "politics"],
            "subscriptions": ["MKBHD", "Linus Tech Tips", "Pokimane", "Hasan Piker", "Ludwig", "Cr1TiKaL", "Dream"],
        }
    },
    "techtara": {
        "name": "TechTara",
        "mock_file": "mock_videos_techtara.json",
        "consumption": {
            "liked_video_count": 31,
            "liked_topics": ["tech", "productivity", "education", "science", "career advice"],
            "subscriptions": ["Fireship", "ThePrimeagen", "Lex Fridman", "Ali Abdaal", "3Blue1Brown", "Kurzgesagt", "Y Combinator"],
        }
    }
}


@app.get("/")
def root():
    return {"status": "ok"}


# ---- AUTH ----

@app.get("/auth/login")
def login():
    url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={config.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={config.REDIRECT_URI}"
        f"&response_type=code"
        f"&scope={config.YOUTUBE_SCOPES}"
        f"&access_type=offline"
        f"&prompt=consent"
    )
    return RedirectResponse(url)


@app.get("/auth/callback")
async def callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_resp = await client.post("https://oauth2.googleapis.com/token", data={
            "code": code,
            "client_id": config.GOOGLE_CLIENT_ID,
            "client_secret": config.GOOGLE_CLIENT_SECRET,
            "redirect_uri": config.REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        token_data = token_resp.json()
        access_token = token_data.get("access_token")

        # Identify the Google account so a repeat login maps to the same
        # user row instead of creating a new one every time.
        userinfo_resp = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
    userinfo = userinfo_resp.json()
    google_sub = userinfo.get("sub")
    display_name = userinfo.get("name") or "Creator"

    user = db.query(User).filter(User.google_sub == google_sub).first() if google_sub else None
    if user is None:
        user = User(google_sub=google_sub, display_name=display_name, is_demo=False, current_profile_key="maya")
        db.add(user)
    user.youtube_access_token = access_token
    user.is_demo = False
    db.commit()
    db.refresh(user)

    redirect = RedirectResponse(f"{config.FRONTEND_URL}?auth=success")
    redirect.set_cookie(
        key=config.SESSION_COOKIE,
        value=create_session_token(user.id),
        max_age=config.SESSION_TTL_SECONDS,
        httponly=True,
        secure=config.IS_CROSS_SITE_PROD,
        samesite="none" if config.IS_CROSS_SITE_PROD else "lax",
    )
    return redirect


# ---- PROFILES ----

@app.get("/api/profiles")
def list_profiles(current_user: User = Depends(get_current_user)):
    return {
        "profiles": {k: v["name"] for k, v in PROFILES.items()},
        "current": current_user.current_profile_key,
    }


@app.post("/api/profiles/switch")
def switch_profile(
    body: ProfileSwitchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.profile not in PROFILES:
        return {"error": "unknown profile"}
    current_user.current_profile_key = body.profile
    db.commit()
    return {"switched_to": body.profile, "name": PROFILES[body.profile]["name"]}


# ---- ANALYSIS ----

def _get_or_compute_analysis(current_user: User, db: Session) -> dict:
    """Plain helper function, not a route. The old code called `await
    analyze()` directly from other route handlers to reuse its logic, which
    bypasses FastAPI's dependency injection — a known anti-pattern. Every
    route that needs computed metrics calls this instead.

    NOTE ON SCOPE: today this always computes from the demo mock-data
    profiles (maya/gamerz/techtara), even for a real OAuth login — matching
    the original hackathon behavior. Wiring a real-OAuth user's *own* YouTube
    data into this function is the next piece of work, not done here."""
    profile_key = current_user.current_profile_key or "maya"

    cached = (
        db.query(Analysis)
        .filter(Analysis.user_id == current_user.id, Analysis.profile_key == profile_key)
        .first()
    )
    if cached:
        return cached.metrics

    profile = PROFILES[profile_key]
    try:
        with open(profile["mock_file"], "r") as f:
            videos = json.load(f)
    except FileNotFoundError:
        return {"error": f"mock data file {profile['mock_file']} not found"}

    metrics = process_videos(videos)
    metrics["channel_name"] = profile["name"]
    metrics["consumption"] = profile["consumption"]

    db.add(Analysis(user_id=current_user.id, profile_key=profile_key, metrics=metrics))
    db.commit()

    return metrics


@app.get("/api/analyze")
def analyze(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _get_or_compute_analysis(current_user, db)


# ---- FOOTPRINT ----

@app.get("/api/footprint")
def get_footprint(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data = _get_or_compute_analysis(current_user, db)
    if "error" in data:
        return data

    interpretation = interpret_footprint(
        data["footprint"],
        data["channel_name"],
        data.get("consumption"),
        cache_key=current_user.current_profile_key or "maya",
    )
    return {
        "metrics": data["footprint"],
        "consumption": data["consumption"],
        "highlights": data.get("highlights", {}),
        "interpretation": json.loads(interpretation),
        "channel_name": data["channel_name"],
    }


# ---- MIRROR ----

@app.get("/api/mirror")
def get_mirror(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data = _get_or_compute_analysis(current_user, db)
    if "error" in data:
        return data

    interpretation = interpret_mirror(
        data["mirror"],
        data["viral"],
        cache_key=current_user.current_profile_key or "maya",
    )
    return {
        "metrics": data["mirror"],
        "viral": data["viral"],
        "interpretation": json.loads(interpretation),
    }


# ---- SANDBOX ----

@app.post("/api/sandbox", dependencies=[Depends(rate_limit(max_requests=8, window_seconds=300))])
def run_sandbox(
    body: SandboxRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = _get_or_compute_analysis(current_user, db)
    if "error" in data:
        return data

    interpretation = interpret_sandbox(data["footprint"], data["mirror"], body.move)
    report = json.loads(interpretation)

    # One active sandbox conversation per user, matching the single-page UI —
    # starting a new stress test replaces whatever conversation was there.
    db.query(SandboxSession).filter(SandboxSession.user_id == current_user.id).delete()
    db.add(SandboxSession(user_id=current_user.id, proposed_move=body.move, report=report, history=[]))
    db.commit()

    return {"report": report}


@app.post("/api/sandbox/chat", dependencies=[Depends(rate_limit(max_requests=15, window_seconds=300))])
def sandbox_chat(
    body: SandboxChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = _get_or_compute_analysis(current_user, db)
    if "error" in data:
        return data

    session = (
        db.query(SandboxSession)
        .filter(SandboxSession.user_id == current_user.id)
        .order_by(SandboxSession.created_at.desc())
        .first()
    )
    if session is None:
        session = SandboxSession(user_id=current_user.id, proposed_move=body.move or body.message, history=[])
        db.add(session)

    history = list(session.history or [])
    history.append({"role": "user", "content": body.message})

    response_text = sandbox_conversation(
        data["footprint"],
        data["mirror"],
        session.proposed_move,
        history,
        session.report,
    )
    history.append({"role": "assistant", "content": response_text})
    session.history = history
    db.commit()

    return {"response": response_text, "turn": len(history) // 2}


# ---- VAULT ----

@app.post("/api/vault", dependencies=[Depends(rate_limit(max_requests=6, window_seconds=300))])
def vault_protect(
    body: VaultRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    concepts = extract_concepts(body.idea)

    now = datetime.now(timezone.utc)
    still_protected = db.query(VaultEntry).filter(VaultEntry.expires_at > now).all()
    existing_concept_sets = [entry.concept_tags for entry in still_protected]
    similarity = check_similarity(concepts, existing_concept_sets)

    idea_hash, expires_at, action_deadline, proof, token = build_proof(body.idea, concepts, current_user.id)

    db.add(VaultEntry(
        user_id=current_user.id,
        idea_hash=idea_hash,
        concept_tags=concepts,
        certificate_jwt=token,
        expires_at=expires_at,
    ))
    db.commit()

    return {
        "proof": proof,
        "token": token,
        "concepts_extracted": len(concepts),
        "similarity": similarity,
        "certificate": {
            "hash": idea_hash,
            "timestamp": proof["timestamp"],
            "expires": proof["expires"],
            "action_deadline": proof["action_deadline"],
            "signed_token": token,
        },
    }


@app.post("/api/vault/seed", dependencies=[Depends(rate_limit(max_requests=2, window_seconds=3600))])
def vault_seed(db: Session = Depends(get_db)):
    test_ideas = [
        "A cooking competition show where home cooks compete using only ingredients from a mystery box, judged by celebrity chefs, with weekly elimination rounds",
        "A fitness app that uses AI to analyze your workout form through your phone camera and gives real-time corrections with voice feedback",
        "A YouTube series documenting the process of renovating a vintage van into a mobile kitchen, traveling to different cities and cooking with local ingredients",
    ]
    for idea in test_ideas:
        concepts = extract_concepts(idea)
        idea_hash, expires_at, _action_deadline, _proof, token = build_proof(idea, concepts, user_id=None)
        db.add(VaultEntry(
            user_id=None,
            idea_hash=idea_hash,
            concept_tags=concepts,
            certificate_jwt=token,
            expires_at=expires_at,
        ))
    db.commit()

    total = db.query(VaultEntry).count()
    return {"seeded": len(test_ideas), "total_in_vault": total}
