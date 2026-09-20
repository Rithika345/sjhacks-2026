import time
from typing import Optional
from jose import jwt, JWTError

import config


def create_session_token(user_id: int) -> str:
    payload = {"user_id": user_id, "exp": int(time.time()) + config.SESSION_TTL_SECONDS}
    return jwt.encode(payload, config.SESSION_SECRET, algorithm="HS256")


def read_session_user_id(token: Optional[str]) -> Optional[int]:
    """Returns the user_id encoded in a session cookie, or None if the cookie
    is missing, expired, or invalid. Deliberately does not raise: callers
    (see deps.get_current_user) treat "no valid session" as "provision a new
    demo session" rather than as an error, since this app has no hard login
    wall."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, config.SESSION_SECRET, algorithms=["HS256"])
    except JWTError:
        return None
    return payload.get("user_id")
