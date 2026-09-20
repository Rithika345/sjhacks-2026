from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

import main


def _fake_claude_response(text):
    resp = MagicMock()
    resp.content = [MagicMock(text=text)]
    return resp


def test_two_visitors_get_fully_isolated_sessions():
    """This is the exact bug the DB/auth refactor exists to fix: the old
    code used one shared global dict for every visitor. Two separate
    TestClient instances = two separate cookie jars = two separate
    "browsers" hitting the same running app."""
    visitor_a = TestClient(main.app)
    visitor_b = TestClient(main.app)

    visitor_a.post("/api/profiles/switch", json={"profile": "gamerz"})
    data_a = visitor_a.get("/api/analyze").json()
    data_b = visitor_b.get("/api/analyze").json()

    assert data_a["channel_name"] == "GamerzHub"
    assert data_b["channel_name"] == "Maya's Kitchen"  # untouched by A


def test_session_cookie_remembers_profile_across_requests():
    visitor = TestClient(main.app)
    visitor.post("/api/profiles/switch", json={"profile": "techtara"})
    first = visitor.get("/api/analyze").json()
    second = visitor.get("/api/analyze").json()
    assert first["channel_name"] == second["channel_name"] == "TechTara"


def test_analyze_is_cached_not_recomputed_on_every_call():
    from db import SessionLocal
    from models import Analysis

    visitor = TestClient(main.app)
    visitor.get("/api/analyze")
    visitor.get("/api/analyze")
    visitor.get("/api/analyze")

    db = SessionLocal()
    try:
        assert db.query(Analysis).count() == 1
    finally:
        db.close()


def test_switch_to_unknown_profile_returns_error_not_500():
    visitor = TestClient(main.app)
    resp = visitor.post("/api/profiles/switch", json={"profile": "nonexistent"})
    assert resp.status_code == 200
    assert resp.json() == {"error": "unknown profile"}


def test_vault_request_missing_idea_is_a_validation_error():
    visitor = TestClient(main.app)
    resp = visitor.post("/api/vault", json={})
    assert resp.status_code == 422


@patch("routers.interpret.client.messages.create")
def test_footprint_endpoint_returns_interpretation(mock_create):
    mock_create.return_value = _fake_claude_response("""{
        "topics_summary": "test summary",
        "concentration_risk_note": "test note",
        "overton_window": "test window",
        "audience_expects": ["a"],
        "cancel_risk_flags": [],
        "consumption_gap": "No significant gap detected"
    }""")

    visitor = TestClient(main.app)
    resp = visitor.get("/api/footprint")
    assert resp.status_code == 200
    body = resp.json()
    assert body["interpretation"]["topics_summary"] == "test summary"
    assert body["channel_name"] == "Maya's Kitchen"


@patch("routers.vault.client.messages.create")
def test_vault_protect_persists_an_entry_and_returns_a_certificate(mock_create):
    mock_create.return_value = _fake_claude_response('["idea one", "idea two"]')

    from db import SessionLocal
    from models import VaultEntry

    visitor = TestClient(main.app)
    resp = visitor.post("/api/vault", json={"idea": "a cooking show about mystery boxes"})
    assert resp.status_code == 200
    body = resp.json()
    assert "certificate" in body
    assert body["concepts_extracted"] == 2

    db = SessionLocal()
    try:
        assert db.query(VaultEntry).count() == 1
    finally:
        db.close()


def test_unhandled_error_returns_clean_json_not_a_raw_500_page():
    # No mock on the Claude client here: the fake API key in conftest causes
    # a real AuthenticationError, which should be caught by the global
    # exception handler and turned into a clean JSON body.
    visitor = TestClient(main.app, raise_server_exceptions=False)
    resp = visitor.get("/api/footprint")
    assert resp.status_code == 500
    assert resp.json() == {"error": "something went wrong on our end"}
