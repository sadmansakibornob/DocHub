from app.db import supabase

# --------------------------------------------------
# USER PROFILE
# --------------------------------------------------


def get_user_profile(user_id: str) -> dict | None:
    response = (
        supabase.table("users")
        .select("id,name,email,role,is_banned,ban_reason")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def create_user_profile(user_data: dict) -> dict | None:
    response = (
        supabase.table("users").insert(user_data).select("id,name,email,role").execute()
    )

    if not response.data:
        return None

    return response.data[0]


def update_user_profile(user_id: str, profile_data: dict) -> dict | None:
    response = (
        supabase.table("users")
        .update(profile_data)
        .eq("id", user_id)
        .select("id,name,email,role,is_banned")
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


# --------------------------------------------------
# LOGIN ATTEMPTS
# --------------------------------------------------


def count_failed_attempts_by_email(email: str, since: str) -> int:
    response = (
        supabase.table("login_attempts")
        .select("id", count="exact")
        .eq("email", email)
        .eq("succeeded", False)
        .gte("attempted_at", since)
        .execute()
    )

    return response.count or 0


def count_failed_attempts_by_ip(ip_address: str | None, since: str) -> int:
    response = (
        supabase.table("login_attempts")
        .select("id", count="exact")
        .eq("ip_address", ip_address)
        .eq("succeeded", False)
        .gte("attempted_at", since)
        .execute()
    )

    return response.count or 0


def record_login_attempt(attempt_data: dict) -> None:
    supabase.table("login_attempts").insert(attempt_data).execute()


# --------------------------------------------------
# AUTH SESSIONS
# --------------------------------------------------


def create_auth_session(session_data: dict) -> dict | None:
    response = (
        supabase.table("auth_sessions").insert(session_data).select("id").execute()
    )

    if not response.data:
        return None

    return response.data[0]


def get_session_by_refresh_hash(token_hash: str) -> dict | None:
    response = (
        supabase.table("auth_sessions")
        .select("id,user_id,supabase_refresh_enc,revoked_at,expires_at")
        .eq("refresh_token_hash", token_hash)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def rotate_refresh_session(
    session_id: str,
    old_hash: str,
    new_data: dict,
) -> bool:
    response = (
        supabase.table("auth_sessions")
        .update(new_data)
        .eq("id", session_id)
        .eq("refresh_token_hash", old_hash)
        .is_("revoked_at", "null")
        .select("id")
        .execute()
    )

    return bool(response.data)


def revoke_session(
    session_id: str,
    user_id: str | None = None,
    active_only: bool = True,
) -> list[dict]:
    query = (
        supabase.table("auth_sessions")
        .update({"revoked_at": "now()"})
        .eq("id", session_id)
    )

    if user_id is not None:
        query = query.eq("user_id", user_id)

    if active_only:
        query = query.is_("revoked_at", "null")

    response = query.select("id,user_id").execute()

    return response.data or []


def revoke_user_sessions(user_id: str) -> None:
    (
        supabase.table("auth_sessions")
        .update({"revoked_at": "now()"})
        .eq("user_id", user_id)
        .is_("revoked_at", "null")
        .execute()
    )


def get_user_sessions(user_id: str) -> list[dict]:
    response = (
        supabase.table("auth_sessions")
        .select(
            "id,user_agent,ip_address,created_at,last_seen_at,expires_at,revoked_at"
        )
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    return response.data or []
