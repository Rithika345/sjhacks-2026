"""Single source of truth for all environment-driven config. Everything else
(main.py, db.py, auth.py, deps.py) imports from here instead of reading
os.getenv directly, so there's exactly one place to look when a URL, secret,
or default needs to change."""

import os
from dotenv import load_dotenv

load_dotenv()

# ---- URLs ----
# Default to local dev so nothing changes when running on localhost. In
# production set these as real environment variables (Cloud Run env vars),
# never by editing this file.
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", FRONTEND_URL).split(",")

# ---- Database ----
# SQLite locally and for tests, Supabase Postgres in production. Same code,
# zero changes needed when DATABASE_URL is swapped via env var.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fifth_postulate.db")

# ---- Google OAuth ----
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = f"{BACKEND_URL}/auth/callback"
YOUTUBE_SCOPES = "https://www.googleapis.com/auth/youtube.readonly"

# ---- Sessions ----
# Set a real SESSION_SECRET env var in production. The dev default is fine
# for local work only.
SESSION_SECRET = os.getenv("SESSION_SECRET", "dev-only-insecure-secret-change-me")
SESSION_COOKIE = "fp_session"
SESSION_TTL_SECONDS = 60 * 60 * 24 * 30  # 30 days

# Cross-site cookies (Netlify frontend + Cloud Run backend, different domains)
# require SameSite=None; Secure, which in turn requires HTTPS. Locally both
# URLs are http on different ports, so we fall back to a Lax/non-secure
# cookie there instead, since Secure cookies are rejected over plain HTTP.
IS_CROSS_SITE_PROD = FRONTEND_URL.startswith("https") and BACKEND_URL.startswith("https")

# ---- Vault ----
VAULT_SECRET = os.getenv("VAULT_SECRET", "sjhacks-demo-key-2026")
