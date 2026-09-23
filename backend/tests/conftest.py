import os
import sys
import pathlib

# Make "import main" etc. work regardless of where pytest is invoked from.
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

# Force a throwaway SQLite file for the whole test session, set BEFORE any
# app module is imported. main.py builds its DB engine at import time, so
# this has to happen first, or tests would silently run against whatever
# DATABASE_URL a real local .env points at (including production Postgres,
# if one is ever configured there for manual testing).
os.environ["DATABASE_URL"] = "sqlite:///./test_fifth_postulate.db"
os.environ.setdefault("ANTHROPIC_API_KEY", "test-key-not-a-real-key")
os.environ.setdefault("GOOGLE_CLIENT_ID", "test-client-id")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "test-client-secret")
os.environ.setdefault("SESSION_SECRET", "test-session-secret")
os.environ.setdefault("VAULT_SECRET", "test-vault-secret")

import pytest  # noqa: E402


@pytest.fixture(autouse=True)
def _clean_database():
    """Every test starts from a clean, empty database so tests never depend
    on execution order or leak state into each other."""
    from db import Base, engine

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture(autouse=True)
def _clean_interpretation_cache():
    """routers.interpret caches footprint/mirror interpretations in
    module-level dicts, keyed by profile, so the real Anthropic API only
    ever gets called once per profile in production. That cache would
    otherwise leak between tests in this same process -- e.g. a mocked
    footprint call in one test silently serving its cached result to a
    later test that expects a real (failing) API call. Reset it every test
    so each test's mocks/expectations are the only thing in play."""
    from routers import interpret

    interpret._footprint_cache.clear()
    interpret._mirror_cache.clear()
    yield
