import hashlib
import hmac
import logging
import secrets
from datetime import datetime, timedelta, timezone

from cryptography.fernet import Fernet
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response

from app.audit import audit
from app.config import settings
from app.db import new_auth_client, supabase
from app.repositories import auth_repository as auth_repo
from app.schemas.auth_schema import (
    LoginRequest,
    PasswordChangeRequest,
    ProfileUpdateRequest,
    SignupRequest,
)
from app.security import get_current_user, issue_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

log = logging.getLogger(__name__)

fernet = Fernet(settings.refresh_encryption_key.encode())

COOKIE = "dochub_refresh"


# --------------------------------------------------
# PASSWORD AND TOKEN HELPERS
# --------------------------------------------------


def _peppered(password: str) -> str:
    """
    Apply a server-side HMAC pepper before Supabase hashes the password.
    Keep this consistent across signup, login and password changes.
    """
    return hmac.new(
        settings.password_pepper.encode(),
        password.encode(),
        hashlib.sha256,
    ).hexdigest()


def _hash(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def _cookie(response: Response, token: str) -> None:
    response.set_cookie(
        COOKIE,
        token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/api/auth",
        max_age=settings.refresh_token_days * 86400,
    )


def _clear_cookie(response: Response) -> None:
    response.delete_cookie(
        COOKIE,
        path="/api/auth",
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )


# --------------------------------------------------
# USER PROFILE
# --------------------------------------------------


def _profile(user_id: str) -> dict:
    user = auth_repo.get_user_profile(user_id)

    if not user:
        raise HTTPException(
            status_code=403,
            detail="Account profile is unavailable",
        )

    if user.get("is_banned"):
        raise HTTPException(
            status_code=403,
            detail="This account is suspended",
        )

    if user.get("role") not in {"user", "admin"}:
        raise HTTPException(
            status_code=403,
            detail="Invalid account role",
        )

    return user


# --------------------------------------------------
# SESSION CREATION
# --------------------------------------------------


def _new_session(
    user: dict,
    supabase_refresh: str,
    request: Request,
    response: Response,
) -> dict:

    raw_refresh = secrets.token_urlsafe(48)

    now = datetime.now(timezone.utc)
    expires = now + timedelta(days=settings.refresh_token_days)

    row = auth_repo.create_auth_session(
        {
            "user_id": user["id"],
            "refresh_token_hash": _hash(raw_refresh),
            "supabase_refresh_enc": fernet.encrypt(supabase_refresh.encode()).decode(),
            "user_agent": request.headers.get("user-agent", "")[:500],
            "ip_address": request.client.host if request.client else None,
            "expires_at": expires.isoformat(),
            "last_seen_at": now.isoformat(),
        }
    )

    if not row:
        raise HTTPException(
            status_code=500,
            detail="Could not create authentication session",
        )

    _cookie(response, raw_refresh)

    return {
        "access_token": issue_access_token(user, row["id"]),
        "token_type": "bearer",
        "expires_in": min(settings.access_token_minutes, 15) * 60,
        "user": user,
    }


# --------------------------------------------------
# SIGNUP / REGISTER
# --------------------------------------------------


@router.post("/signup", status_code=201)
@router.post("/register", status_code=201, include_in_schema=False)
def signup(
    payload: SignupRequest,
    request: Request,
    response: Response,
):

    client = new_auth_client()

    try:
        created = client.auth.sign_up(
            {
                "email": str(payload.email).lower(),
                "password": _peppered(payload.password),
            }
        )

        if not created.user:
            raise HTTPException(
                status_code=400,
                detail="Registration could not be completed",
            )

        uid = str(created.user.id)

        inserted = auth_repo.create_user_profile(
            {
                "id": uid,
                "name": payload.name,
                "email": str(payload.email).lower(),
                "role": "user",
                "is_banned": False,
            }
        )

        if not inserted:
            raise HTTPException(
                status_code=500,
                detail="Could not create user profile",
            )

        audit(uid, "auth.signup", request, "user", uid)

        if created.session:
            user = _profile(uid)

            data = _new_session(
                user,
                created.session.refresh_token,
                request,
                response,
            )

            return {
                "message": "Account created",
                **data,
            }

        return {
            "message": "Account created. Check your email to confirm the address.",
            "user": inserted,
            "requires_email_confirmation": True,
        }

    except HTTPException:
        raise

    except Exception as exc:
        log.exception("Signup failed")

        raise HTTPException(
            status_code=400,
            detail="Registration failed. The email may already be registered.",
        ) from exc


# --------------------------------------------------
# LOGIN
# --------------------------------------------------


@router.post("/login")
def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
):

    email = str(payload.email).lower()
    ip = request.client.host if request.client else None

    since = (datetime.now(timezone.utc) - timedelta(minutes=15)).isoformat()

    # Database-backed login throttling.
    by_email = auth_repo.count_failed_attempts_by_email(
        email,
        since,
    )

    by_ip = auth_repo.count_failed_attempts_by_ip(
        ip,
        since,
    )

    if by_email >= 8 or by_ip >= 20:
        raise HTTPException(
            status_code=429,
            detail="Too many failed login attempts. Try again later.",
        )

    client = new_auth_client()

    try:
        result = client.auth.sign_in_with_password(
            {
                "email": email,
                "password": _peppered(payload.password),
            }
        )

        if not result.user or not result.session:
            raise ValueError("No session")

        user = _profile(str(result.user.id))

        auth_repo.record_login_attempt(
            {
                "email": email,
                "ip_address": ip,
                "user_agent": request.headers.get("user-agent", "")[:500],
                "succeeded": True,
            }
        )

        data = _new_session(
            user,
            result.session.refresh_token,
            request,
            response,
        )

        audit(user["id"], "auth.login", request, "session")

        return data

    except HTTPException:
        raise

    except Exception as exc:
        auth_repo.record_login_attempt(
            {
                "email": email,
                "ip_address": ip,
                "user_agent": request.headers.get("user-agent", "")[:500],
                "succeeded": False,
            }
        )

        audit(None, "auth.login.failed", request, "account", email)

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        ) from exc


# --------------------------------------------------
# REFRESH TOKEN
# --------------------------------------------------


@router.post("/refresh")
def refresh(
    request: Request,
    response: Response,
    refresh_token: str | None = Cookie(
        default=None,
        alias=COOKIE,
    ),
):

    if not refresh_token:
        raise HTTPException(
            status_code=401,
            detail="Refresh session is missing",
        )

    old_hash = _hash(refresh_token)

    row = auth_repo.get_session_by_refresh_hash(old_hash)

    if not row or row.get("revoked_at"):
        _clear_cookie(response)

        raise HTTPException(
            status_code=401,
            detail="Refresh session is invalid",
        )

    expires_at = datetime.fromisoformat(row["expires_at"].replace("Z", "+00:00"))

    if expires_at <= datetime.now(timezone.utc):
        auth_repo.revoke_session(
            row["id"],
            active_only=True,
        )

        _clear_cookie(response)

        raise HTTPException(
            status_code=401,
            detail="Refresh session expired",
        )

    try:
        old_supabase_refresh = fernet.decrypt(
            row["supabase_refresh_enc"].encode()
        ).decode()

        result = new_auth_client().auth.refresh_session(old_supabase_refresh)

        if not result.session or not result.user:
            raise ValueError("No refreshed session")

        user = _profile(str(result.user.id))

        new_raw = secrets.token_urlsafe(48)
        now = datetime.now(timezone.utc).isoformat()

        changed = auth_repo.rotate_refresh_session(
            session_id=row["id"],
            old_hash=old_hash,
            new_data={
                "refresh_token_hash": _hash(new_raw),
                "supabase_refresh_enc": fernet.encrypt(
                    result.session.refresh_token.encode()
                ).decode(),
                "last_seen_at": now,
            },
        )

        if not changed:
            raise HTTPException(
                status_code=401,
                detail="Refresh token has already been rotated",
            )

        _cookie(response, new_raw)

        audit(
            user["id"],
            "auth.refresh",
            request,
            "session",
            row["id"],
        )

        return {
            "access_token": issue_access_token(user, row["id"]),
            "token_type": "bearer",
            "expires_in": min(settings.access_token_minutes, 15) * 60,
            "user": user,
        }

    except HTTPException:
        raise

    except Exception as exc:
        auth_repo.revoke_session(
            row["id"],
            active_only=True,
        )

        _clear_cookie(response)

        raise HTTPException(
            status_code=401,
            detail="Refresh session is no longer valid",
        ) from exc


# --------------------------------------------------
# LOGOUT
# --------------------------------------------------


@router.post("/logout", status_code=204)
def logout(
    request: Request,
    response: Response,
    refresh_token: str | None = Cookie(
        default=None,
        alias=COOKIE,
    ),
):

    if refresh_token:
        old_hash = _hash(refresh_token)

        row = auth_repo.get_session_by_refresh_hash(old_hash)

        if row:
            auth_repo.revoke_session(
                row["id"],
                active_only=False,
            )

            audit(
                row["user_id"],
                "auth.logout",
                request,
                "session",
                row["id"],
            )

    _clear_cookie(response)


# --------------------------------------------------
# CURRENT USER
# --------------------------------------------------


@router.get("/me")
def get_me(
    user: dict = Depends(get_current_user),
):
    return user


# --------------------------------------------------
# USER SESSIONS
# --------------------------------------------------


@router.get("/sessions")
def my_sessions(
    user: dict = Depends(get_current_user),
):
    return auth_repo.get_user_sessions(user["id"])


@router.delete("/sessions/{session_id}", status_code=204)
def revoke_session(
    session_id: str,
    user: dict = Depends(get_current_user),
):

    rows = auth_repo.revoke_session(
        session_id=session_id,
        user_id=user["id"],
        active_only=True,
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Active session not found",
        )


# --------------------------------------------------
# UPDATE PROFILE
# --------------------------------------------------


@router.patch("/me")
def update_me(
    payload: ProfileUpdateRequest,
    request: Request,
    user: dict = Depends(get_current_user),
):

    updated = auth_repo.update_user_profile(
        user["id"],
        {
            "name": payload.name.strip(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="User profile not found",
        )

    audit(
        user["id"],
        "user.profile.update",
        request,
        "user",
        user["id"],
    )

    return updated


# --------------------------------------------------
# CHANGE PASSWORD
# --------------------------------------------------


@router.post("/change-password", status_code=204)
def change_password(
    payload: PasswordChangeRequest,
    request: Request,
    user: dict = Depends(get_current_user),
):

    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=422,
            detail="New password must be at least 6 characters",
        )

    if len(payload.new_password) > 128:
        raise HTTPException(
            status_code=422,
            detail="New password cannot exceed 128 characters",
        )

    client = new_auth_client()

    try:
        # Verify the current password.
        client.auth.sign_in_with_password(
            {
                "email": user["email"],
                "password": _peppered(payload.current_password),
            }
        )

        # Update the password in Supabase Auth.
        supabase.auth.admin.update_user_by_id(
            user["id"],
            {
                "password": _peppered(payload.new_password),
            },
        )

    except Exception as exc:
        audit(
            user["id"],
            "auth.password.change.failed",
            request,
            "user",
            user["id"],
        )

        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect or password update failed",
        ) from exc

    # Revoke all existing sessions after a password change.
    auth_repo.revoke_user_sessions(user["id"])

    audit(
        user["id"],
        "auth.password.change",
        request,
        "user",
        user["id"],
    )
