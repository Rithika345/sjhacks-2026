#!/bin/bash
# Deploys the backend to Cloud Run, reading secrets out of .env instead of
# hardcoding them here or typing them into a command by hand.
#
# First deploy: we don't know the Cloud Run URL yet, so BACKEND_URL/
# FRONTEND_URL/ALLOWED_ORIGINS stay at whatever .env currently has (fine for
# now -- those only matter for OAuth callbacks and cross-site cookies, which
# we'll wire up correctly once Netlify's URL exists too). Run this script
# again any time after that to redeploy with updated env vars or code.
set -euo pipefail
cd "$(dirname "$0")"

set -a
source .env
set +a

gcloud run deploy fifth-postulate-backend \
  --source . \
  --region us-central1 \
  --project sjhacks-494502 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=${DATABASE_URL},SESSION_SECRET=${SESSION_SECRET},VAULT_SECRET=${VAULT_SECRET},GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID},GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET},ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY},FRONTEND_URL=${FRONTEND_URL},BACKEND_URL=${BACKEND_URL},ALLOWED_ORIGINS=${ALLOWED_ORIGINS}"
  # NOTE: --set-env-vars REPLACES the entire env var set on every deploy,
  # it does not merge. Any var not listed here (including one set by hand
  # in the Cloud Run console) gets silently dropped on the next run of this
  # script. BACKEND_URL was missing from this list before -- meaning every
  # redeploy through this script wiped it back to config.py's localhost
  # default, silently breaking the OAuth redirect_uri in production. If you
  # ever add a new env var by hand in the console, add it here too or it
  # won't survive the next deploy.
