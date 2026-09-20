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
