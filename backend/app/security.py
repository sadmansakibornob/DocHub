from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings
from app.db import supabase

# Optional Bearer authentication.
# FastAPI will now recognize this security scheme in Swagger.
bearer = HTTPBearer(auto_error=False)

ALGORITHM = "HS256"


def issue_access_token(user: dict, session_id: str) -> str:
    now = datetime.now(timezone.utc)

    payload = {
        "sub": str(user["id"]),
        "role": user["role"],
        "sid": session_id,
        "iat": now,
        "exp": now + timedelta(minutes=min(settings.access_token_minutes, 15)),
        "iss": "dochub-api",
        "aud": "dochub",
    }

    return jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=ALGORITHM,
    )


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[ALGORITHM],
            issuer="dochub-api",
            audience="dochub",
            options={"require": ["sub", "role", "sid", "exp", "iat"]},
        )

    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def _active_user(claims: dict) -> dict:
    try:
        # Verify that the session exists and is not revoked.
        session = (
            supabase.table("auth_sessions")
            .select("id,user_id,revoked_at,expires_at")
            .eq("id", claims["sid"])
            .eq("user_id", claims["sub"])
            .limit(1)
            .execute()
            .data
        )

        if not session or session[0].get("revoked_at"):
            raise HTTPException(
                status_code=401,
                detail="Session is revoked",
            )

        # Verify session expiration.
        expires_at = session[0].get("expires_at")

        if expires_at:
            expiry = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))

            if expiry <= datetime.now(timezone.utc):
                raise HTTPException(
                    status_code=401,
                    detail="Session expired",
                )

        # Fetch the latest user information from the database.
        rows = (
            supabase.table("users")
            .select("id,name,email,role,is_banned,ban_reason")
            .eq("id", claims["sub"])
            .limit(1)
            .execute()
            .data
        )

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Authentication service temporarily unavailable",
        ) from exc

    if not rows:
        raise HTTPException(
            status_code=401,
            detail="Account not found",
        )

    user = rows[0]

    if user.get("is_banned"):
        raise HTTPException(
            status_code=403,
            detail="This account is suspended",
        )

    if user.get("role") not in {"user", "admin"}:
        raise HTTPException(
            status_code=403,
            detail="Account role is invalid; contact an administrator",
        )

    # Reject tokens issued before a role change.
    if claims.get("role") != user.get("role"):
        raise HTTPException(
            status_code=401,
            detail="Role changed; sign in again",
        )

    return user


# Required authentication.
# Returns 401 if the request has no valid access token.
def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> dict:

    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    claims = decode_access_token(credentials.credentials)

    return _active_user(claims)


# Optional authentication.
# Allows anonymous access to public articles while identifying
# authenticated users so they can access their own drafts.
def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> dict | None:

    if credentials is None:
        return None

    claims = decode_access_token(credentials.credentials)

    return _active_user(claims)
