from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

from jose import jwt

import config
from routers.vault import build_proof, check_similarity, extract_concepts


def _fake_claude_response(text):
    resp = MagicMock()
    resp.content = [MagicMock(text=text)]
    return resp


# ---- build_proof: pure function, no mocking needed ----

def test_build_proof_returns_valid_signed_jwt():
    idea_hash, expires_at, action_deadline, proof, token = build_proof(
        "a cooking show idea", ["cooking", "competition"], user_id=42
    )

    decoded = jwt.decode(token, config.VAULT_SECRET, algorithms=["HS256"])
    assert decoded["hash"] == idea_hash
    assert decoded["concept_count"] == 2
    assert decoded["user_id"] == 42
    assert decoded["status"] == "protected"


def test_build_proof_expiration_windows_are_correct():
    now = datetime.now(timezone.utc)
    _, expires_at, action_deadline, _, _ = build_proof("idea", ["a"], user_id=1)

    days_to_expiry = (expires_at - now).days
    days_to_action = (action_deadline - now).days
    assert 59 <= days_to_expiry <= 60
    assert 2 <= days_to_action <= 3


def test_build_proof_hash_is_unique_per_call():
    # The hash incorporates a timestamp specifically so the same idea text
    # submitted twice doesn't collide.
    _, _, _, _, token_one = build_proof("same idea text", ["a"], user_id=1)
    _, _, _, _, token_two = build_proof("same idea text", ["a"], user_id=1)
    assert token_one != token_two


# ---- check_similarity ----

def test_check_similarity_with_no_existing_ideas_skips_the_api_call():
    result = check_similarity(["cooking", "competition"], [])
    assert result == {"score": 0, "overlapping_themes": [], "warning": None}


@patch("routers.vault.client.messages.create")
def test_check_similarity_flags_high_overlap_with_a_warning(mock_create):
    mock_create.return_value = _fake_claude_response("""{
        "highest_similarity_percent": 85,
        "overlapping_themes": ["cooking", "competition"],
        "assessment": "high overlap"
    }""")

    result = check_similarity(["cooking", "competition"], [["cooking", "contest"]])
    assert result["highest_similarity_percent"] == 85
    assert result["warning"] is not None


@patch("routers.vault.client.messages.create")
def test_check_similarity_low_overlap_has_no_warning(mock_create):
    mock_create.return_value = _fake_claude_response("""{
        "highest_similarity_percent": 10,
        "overlapping_themes": [],
        "assessment": "low overlap"
    }""")

    result = check_similarity(["cooking"], [["gardening"]])
    assert result["warning"] is None


# ---- extract_concepts ----

@patch("routers.vault.client.messages.create")
def test_extract_concepts_parses_plain_json_array(mock_create):
    mock_create.return_value = _fake_claude_response(
        '["cooking competition", "mystery ingredients", "celebrity judges"]'
    )
    concepts = extract_concepts("a cooking competition show")
    assert concepts == ["cooking competition", "mystery ingredients", "celebrity judges"]


@patch("routers.vault.client.messages.create")
def test_extract_concepts_strips_markdown_backticks(mock_create):
    mock_create.return_value = _fake_claude_response(
        '```json\n["cooking competition", "mystery ingredients"]\n```'
    )
    concepts = extract_concepts("a cooking competition show")
    assert concepts == ["cooking competition", "mystery ingredients"]
