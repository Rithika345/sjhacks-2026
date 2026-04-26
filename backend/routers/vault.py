from dotenv import load_dotenv
load_dotenv()

import os
import hashlib
from datetime import datetime, timezone, timedelta
from jose import jwt
from anthropic import Anthropic
import json

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
PRIVATE_KEY_SECRET = os.getenv("VAULT_SECRET", "sjhacks-demo-key-2026")

# Anonymous concept store — no creator names, no raw ideas
vault_store = []

def extract_concepts(idea_text):
    """Claude extracts key concepts from an idea"""
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
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

def check_similarity(new_concepts):
    """Claude compares new concepts against stored anonymous concepts semantically"""
    if not vault_store:
        return {"score": 0, "overlapping_themes": [], "warning": None}
    
    # Build anonymous list of existing concept sets
    existing = [entry["concepts"] for entry in vault_store]
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        messages=[{"role": "user", "content": f"""Compare the NEW concept set against each EXISTING concept set. Find semantic similarity — not exact word matches. "Baking" and "cooking" are similar. "Competition" and "contest" are similar.

NEW concepts: {new_concepts}

EXISTING concept sets (anonymous, one per line):
{json.dumps(existing)}

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

def create_proof(idea_text: str, user_id: str = "demo-user"):
    """Full vault flow: extract concepts, check similarity, store anonymously, sign proof"""
    
    # Step 1: Extract concepts
    concepts = extract_concepts(idea_text)
    
    # Step 2: Check semantic similarity against existing vault
    similarity = check_similarity(concepts)
    
    # Step 3: Store concepts anonymously (no creator name, no raw idea text)
    now = datetime.now(timezone.utc)
    expiration = now + timedelta(days=60)
    action_deadline = now + timedelta(days=3)
    
    vault_store.append({
        "concepts": concepts,
        "timestamp": now.isoformat(),
        "expires": expiration.isoformat(),
        "status": "protected",
        # NO user_id, NO raw idea text stored
    })
    
    # Step 4: Hash the full idea for the proof certificate (client would do this in production)
    idea_hash = hashlib.sha256(f"{idea_text}{now.isoformat()}".encode()).hexdigest()
    
    # Step 5: Sign as JWT
    proof = {
        "hash": idea_hash,
        "concept_count": len(concepts),
        "timestamp": now.isoformat(),
        "user_id": user_id,
        "expires": expiration.isoformat(),
        "action_deadline": action_deadline.isoformat(),
        "status": "protected",
    }
    token = jwt.encode(proof, PRIVATE_KEY_SECRET, algorithm="HS256")
    
    return {
        "proof": proof,
        "token": token,
        "concepts_extracted": len(concepts),
        "similarity": similarity,
        "certificate": {
            "hash": idea_hash,
            "timestamp": now.isoformat(),
            "expires": expiration.isoformat(),
            "action_deadline": action_deadline.isoformat(),
            "signed_token": token,
        }
    }

def seed_vault(ideas):
    """Pre-populate vault with test ideas for demo"""
    for idea in ideas:
        concepts = extract_concepts(idea)
        vault_store.append({
            "concepts": concepts,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "expires": (datetime.now(timezone.utc) + timedelta(days=60)).isoformat(),
            "status": "protected",
        })