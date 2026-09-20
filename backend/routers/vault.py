"""Pure Vault logic: extracting concepts, checking semantic similarity, and
building the signed proof certificate. No database access here on purpose —
main.py owns persistence (querying/writing VaultEntry rows) and passes in
whatever existing data these functions need. That split is what makes this
module trivial to unit test: every function here is a plain input -> output
transformation, nothing to mock."""

import hashlib
import json
import os
from datetime import datetime, timezone, timedelta
from typing import Optional

from anthropic import Anthropic
from jose import jwt

import config

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

PROTECTION_DAYS = 60
ACTION_WINDOW_DAYS = 3


def extract_concepts(idea_text: str) -> list:
    """Claude extracts key concepts from an idea."""
    response = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=500,
        messages=[{"role": "user", "content": f"""Extract exactly 5-7 core concept tags from this idea. Return ONLY a JSON array of short lowercase strings. No markdown backticks.

Idea: {idea_text}

Example: ["cooking competition", "mystery ingredients", "celebrity judges", "elimination format", "home cooks"]"""}]
    )
    text = response.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return json.loads(text.strip())


def check_similarity(new_concepts: list, existing_concept_sets: list) -> dict:
    """Claude compares new concepts against other still-protected ideas'
    concept sets, semantically. existing_concept_sets is a plain list of
    concept-tag lists (already fetched from the DB by the caller) — this
    function never touches storage directly."""
    if not existing_concept_sets:
        return {"score": 0, "overlapping_themes": [], "warning": None}

    response = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=500,
        messages=[{"role": "user", "content": f"""Compare the NEW concept set against each EXISTING concept set. Find semantic similarity — not exact word matches. "Baking" and "cooking" are similar. "Competition" and "contest" are similar.

NEW concepts: {new_concepts}

EXISTING concept sets (anonymous, one per line):
{json.dumps(existing_concept_sets)}

Return ONLY valid JSON, no backticks:
{{
  "highest_similarity_percent": 0-100,
  "overlapping_themes": ["theme1", "theme2"],
  "assessment": "one sentence explaining the overlap or lack thereof"
}}"""}]
    )
    text = response.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text[:-3]
    result = json.loads(text.strip())

    score = result.get("highest_similarity_percent", 0)
    result["warning"] = f"{score}% semantic overlap with an existing protected idea — consider differentiating" if score > 40 else None
    return result


def build_proof(idea_text: str, concepts: list, user_id: Optional[int]):
    """Builds the certificate + signs the JWT. Pure function, no I/O — the
    caller is responsible for persisting the result. Returns
    (idea_hash, expires_at, action_deadline, proof_dict, token)."""
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=PROTECTION_DAYS)
    action_deadline = now + timedelta(days=ACTION_WINDOW_DAYS)

    idea_hash = hashlib.sha256(f"{idea_text}{now.isoformat()}".encode()).hexdigest()

    proof = {
        "hash": idea_hash,
        "concept_count": len(concepts),
        "timestamp": now.isoformat(),
        "user_id": user_id,
        "expires": expires_at.isoformat(),
        "action_deadline": action_deadline.isoformat(),
        "status": "protected",
    }
    token = jwt.encode(proof, config.VAULT_SECRET, algorithm="HS256")
    return idea_hash, expires_at, action_deadline, proof, token
