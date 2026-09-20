from fastapi import Depends, Request, Response
from sqlalchemy.orm import Session

import config
from auth import create_session_token, read_session_user_id
from db import get_db
from models import User


def get_current_user(request: Request, response: Response, db: Session = Depends(get_db)) -> User:
    """Every data endpoint depends on this instead of reading a shared global.

    If the request carries a valid session cookie, the matching User row is
    returned. Otherwise (first-time visitor, expired cookie, cleared
    cookies) a new demo user is silently provisioned and a fresh cookie is
    set on the response — this app has no login wall, so "not authenticated"
    is never something an endpoint needs to handle.

    Real YouTube OAuth (/auth/callback) sets this same cookie after linking
    a Google account to a User row, so authenticated users flow through this
    exact same dependency afterward.
    """
    user_id = read_session_user_id(request.cookies.get(config.SESSION_COOKIE))
    user = db.get(User, user_id) if user_id else None

    if user is None:
        user = User(display_name="Guest", is_demo=True, current_profile_key="maya")
        db.add(user)
        db.commit()
        db.refresh(user)

    response.set_cookie(
        key=config.SESSION_COOKIE,
        value=create_session_token(user.id),
        max_age=config.SESSION_TTL_SECONDS,
        httponly=True,
        secure=config.IS_CROSS_SITE_PROD,
        samesite="none" if config.IS_CROSS_SITE_PROD else "lax",
    )
    return user
