from datetime import datetime, timedelta, timezone

from app.db import supabase


def now_utc():
    return datetime.now(timezone.utc).isoformat()


# USER QUERIES


def get_user(user_id: str):
    result = (
        supabase.table("users")
        .select("id,name,email,role,is_banned,ban_reason,created_at,updated_at")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )

    return result.data


def list_users(
    search=None,
    role=None,
    status=None,
    limit=25,
    offset=0,
):
    query = supabase.table("users").select("*", count="exact")

    if search:
        query = query.or_(f"name.ilike.%{search}%,email.ilike.%{search}%")

    if role:
        query = query.eq("role", role)

    if status == "active":
        query = query.eq("is_banned", False)
    elif status == "banned":
        query = query.eq("is_banned", True)

    result = (
        query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    )

    return {
        "items": result.data or [],
        "total": result.count or 0,
        "limit": limit,
        "offset": offset,
    }


def update_user_role(user_id: str, role: str):
    return (
        supabase.table("users")
        .update(
            {
                "role": role,
                "updated_at": now_utc(),
            }
        )
        .eq("id", user_id)
        .execute()
    )


def set_user_banned(user_id: str, banned: bool, reason=None):
    return (
        supabase.table("users")
        .update(
            {
                "is_banned": banned,
                "ban_reason": reason if banned else None,
                "updated_at": now_utc(),
            }
        )
        .eq("id", user_id)
        .execute()
    )


def revoke_user_sessions(user_id: str):
    result = (
        supabase.table("auth_sessions")
        .update({"revoked_at": now_utc()})
        .eq("user_id", user_id)
        .is_("revoked_at", "null")
        .execute()
    )

    return len(result.data or [])


# DASHBOARD QUERIES


def count_rows(table: str):
    result = supabase.table(table).select("id", count="exact").execute()

    return result.count or 0


def count_recent_rows(table: str):
    cutoff = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

    result = (
        supabase.table(table)
        .select("id", count="exact")
        .gte("created_at", cutoff)
        .execute()
    )

    return result.count or 0


def get_dashboard_stats():
    banned = (
        supabase.table("users")
        .select("id", count="exact")
        .eq("is_banned", True)
        .execute()
    )

    return {
        "users_total": count_rows("users"),
        "banned_users": banned.count or 0,
        "records_total": count_rows("articles"),
        "groups_total": count_rows("groups"),
        "new_users": count_recent_rows("users"),
        "new_articles": count_recent_rows("articles"),
        "new_groups": count_recent_rows("groups"),
    }


# ARTICLE QUERIES


def get_articles(status=None, limit=50, offset=0):
    query = supabase.table("articles").select("*", count="exact")

    if status:
        query = query.eq("status", status)

    result = (
        query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    )

    return {
        "items": result.data or [],
        "total": result.count or 0,
        "limit": limit,
        "offset": offset,
    }


def get_article(article_id: int):
    result = (
        supabase.table("articles")
        .select("*")
        .eq("id", article_id)
        .maybe_single()
        .execute()
    )

    return result.data


def update_article_status(article_id: int, status: str):
    return (
        supabase.table("articles")
        .update(
            {
                "status": status,
                "updated_at": now_utc(),
            }
        )
        .eq("id", article_id)
        .execute()
    )


def delete_article(article_id: int):
    return supabase.table("articles").delete().eq("id", article_id).execute()


# GROUP QUERIES


def get_groups(limit=50, offset=0):
    result = (
        supabase.table("groups")
        .select("*", count="exact")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )

    return {
        "items": result.data or [],
        "total": result.count or 0,
        "limit": limit,
        "offset": offset,
    }


def delete_group(group_id: str):
    return supabase.table("groups").delete().eq("id", group_id).execute()


# AUDIT QUERIES


def get_audit_logs(
    action=None,
    search=None,
    limit=50,
    offset=0,
):
    query = supabase.table("audit_logs").select("*", count="exact")

    if action:
        query = query.eq("action", action)

    if search:
        query = query.ilike("action", f"%{search}%")

    result = (
        query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    )

    return {
        "items": result.data or [],
        "total": result.count or 0,
        "limit": limit,
        "offset": offset,
    }


# SECURITY QUERIES


def get_failed_logins(limit=100):
    result = (
        supabase.table("login_attempts")
        .select("*")
        .eq("success", False)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    return result.data or []


# EXPORT QUERIES


def get_export_rows(
    table: str,
    fields: str,
    filters=None,
    limit=10000,
):
    query = supabase.table(table).select(fields)

    for column, value in (filters or {}).items():
        if value is not None:
            query = query.eq(column, value)

    result = query.order("created_at", desc=True).limit(limit).execute()

    return result.data or []
