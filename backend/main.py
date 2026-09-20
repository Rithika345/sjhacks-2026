from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
import os
import httpx
import json
from routers.processing import process_videos
from routers.interpret import interpret_footprint, interpret_mirror, interpret_sandbox, sandbox_conversation
from routers.vault import create_proof, seed_vault, vault_store

load_dotenv()

app = FastAPI()

# FRONTEND_URL / BACKEND_URL / ALLOWED_ORIGINS default to local dev so nothing
# changes when running on localhost. In production (Render + Netlify) set these
# as environment variables instead of editing this file.
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", FRONTEND_URL).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = f"{BACKEND_URL}/auth/callback"
SCOPES = "https://www.googleapis.com/auth/youtube.readonly"
DEMO_TOKEN = "demo-mode"

tokens = {}
current_profile = "maya"
analysis_cache = {}  # Cache so we don't recompute on every endpoint

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
    return {"status": "ok", "current_profile": current_profile}

# ---- AUTH ----

@app.get("/auth/login")
def login():
    url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&response_type=code"
        f"&scope={SCOPES}"
        f"&access_type=offline"
        f"&prompt=consent"
    )
    return RedirectResponse(url)

@app.get("/auth/callback")
async def callback(code: str):
    async with httpx.AsyncClient() as client:
        resp = await client.post("https://oauth2.googleapis.com/token", data={
            "code": code,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
            "grant_type": "authorization_code",
        })
    token_data = resp.json()
    tokens["access_token"] = token_data.get("access_token")
    return RedirectResponse(f"{FRONTEND_URL}?auth=success")

# ---- PROFILES ----

@app.get("/api/profiles")
def list_profiles():
    return {"profiles": {k: v["name"] for k, v in PROFILES.items()}, "current": current_profile}

@app.post("/api/profiles/switch")
async def switch_profile(request: Request):
    global current_profile, analysis_cache
    body = await request.json()
    profile_id = body.get("profile", "maya")
    if profile_id in PROFILES:
        current_profile = profile_id
        analysis_cache = {}  # Clear cache on profile switch
        return {"switched_to": profile_id, "name": PROFILES[profile_id]["name"]}
    return {"error": "unknown profile"}

# ---- ANALYSIS (cached) ----

@app.get("/api/analyze")
async def analyze():
    global analysis_cache

    if not tokens.get("access_token"):
        # No real YouTube OAuth on file (e.g. a visitor who hasn't logged in with
        # a whitelisted test-user Google account). Fall back to demo mode instead
        # of erroring out, so the public deploy always shows working data.
        tokens["access_token"] = DEMO_TOKEN

    # Return cache if available
    if analysis_cache.get("profile") == current_profile:
        return analysis_cache["data"]
    
    profile = PROFILES[current_profile]
    
    try:
        with open(profile["mock_file"], "r") as f:
            videos = json.load(f)
    except FileNotFoundError:
        return {"error": f"mock data file {profile['mock_file']} not found"}
    
    metrics = process_videos(videos)
    metrics["channel_name"] = profile["name"]
    metrics["consumption"] = profile["consumption"]
    
    # Cache it
    analysis_cache = {"profile": current_profile, "data": metrics}
    
    return metrics

# ---- FOOTPRINT ----

@app.get("/api/footprint")
async def get_footprint():
    data = await analyze()
    if "error" in data:
        return data
    
    interpretation = interpret_footprint(
        data["footprint"], 
        data["channel_name"],
        data.get("consumption")  # NOW feeds consumption data to Claude
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
async def get_mirror():
    data = await analyze()
    if "error" in data:
        return data
    
    interpretation = interpret_mirror(data["mirror"], data["viral"])
    return {
        "metrics": data["mirror"],
        "viral": data["viral"],
        "interpretation": json.loads(interpretation),
    }

# ---- SANDBOX ----

sandbox_sessions = {}

@app.post("/api/sandbox")
async def run_sandbox(request: Request):
    body = await request.json()
    proposed_move = body.get("move", "")
    
    data = await analyze()
    if "error" in data:
        return data
    
    interpretation = interpret_sandbox(data["footprint"], data["mirror"], proposed_move)
    report = json.loads(interpretation)
    
    # Store report so chat can reference it
    sandbox_sessions["last_report"] = report
    
    return {"report": report}

@app.post("/api/sandbox/chat")
async def sandbox_chat(request: Request):
    body = await request.json()
    session_id = body.get("session_id", "default")
    message = body.get("message", "")
    proposed_move = body.get("move", "")
    
    data = await analyze()
    if "error" in data:
        return data
    
    if session_id not in sandbox_sessions or proposed_move:
        sandbox_sessions[session_id] = {"move": proposed_move or message, "history": []}
    
    session = sandbox_sessions[session_id]
    session["history"].append({"role": "user", "content": message})
    
    # Pass the initial report into the conversation
    initial_report = sandbox_sessions.get("last_report")
    
    response = sandbox_conversation(
        data["footprint"],
        data["mirror"],
        session["move"],
        session["history"],
        initial_report
    )
    session["history"].append({"role": "assistant", "content": response})
    
    return {"response": response, "turn": len(session["history"]) // 2}

# ---- VAULT ----

@app.post("/api/vault")
async def vault_protect(request: Request):
    body = await request.json()
    idea_text = body.get("idea", "")
    if not idea_text:
        return {"error": "no idea provided"}
    return create_proof(idea_text)

@app.post("/api/vault/seed")
async def vault_seed():
    test_ideas = [
        "A cooking competition show where home cooks compete using only ingredients from a mystery box, judged by celebrity chefs, with weekly elimination rounds",
        "A fitness app that uses AI to analyze your workout form through your phone camera and gives real-time corrections with voice feedback",
        "A YouTube series documenting the process of renovating a vintage van into a mobile kitchen, traveling to different cities and cooking with local ingredients",
    ]
    seed_vault(test_ideas)
    return {"seeded": len(test_ideas), "total_in_vault": len(vault_store)}