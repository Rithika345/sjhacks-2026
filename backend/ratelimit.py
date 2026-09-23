"""Minimal in-process rate limiter for the endpoints that call the
Anthropic API on arbitrary user input (sandbox, vault) -- those can't be
cached the way the deterministic footprint/mirror interpretations are, so
this is what stands between a public demo link and someone hammering it to
run up the API bill.

In-memory and per-container on purpose: this app is a portfolio demo on a
single small Cloud Run instance, not a service that needs to survive
instance churn or coordinate across replicas. If it ever gets real traffic
at scale, swap this for a Redis- or DB-backed limiter instead.
"""

import threading
import time
from collections import defaultdict

from fastapi import HTTPException, Request

_lock = threading.Lock()
_hits: dict[str, list[float]] = defaultdict(list)


def _client_key(request: Request) -> str:
    # Cloud Run sits behind Google's front end, which sets X-Forwarded-For
    # to "<client>, <proxy1>, ...". request.client.host would just be the
    # front end's own address, not the visitor's.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def rate_limit(max_requests: int, window_seconds: int):
    """Returns a FastAPI dependency enforcing max_requests per window_seconds,
    keyed by (route path, client IP)."""

    def dependency(request: Request) -> None:
        key = f"{request.url.path}:{_client_key(request)}"
        now = time.time()
        with _lock:
            recent = [t for t in _hits[key] if now - t < window_seconds]
            if len(recent) >= max_requests:
                retry_after = int(window_seconds - (now - recent[0]))
                raise HTTPException(
                    status_code=429,
                    detail="Too many requests -- please wait a few minutes and try again.",
                    headers={"Retry-After": str(max(retry_after, 1))},
                )
            recent.append(now)
            _hits[key] = recent

    return dependency
