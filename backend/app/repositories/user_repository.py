from app.db import supabase

# --------------------------------------------------
# LIST USERS
# --------------------------------------------------


def get_users(limit: int = 25, offset: int = 0) -> dict:
    response = (
        supabase.table("users")
        .select(
            "id,name,email,role,is_banned,created_at",
            count="exact",
        )
        .order("name")
        .range(offset, offset + limit - 1)
        .execute()
    )

    return {
        "items": response.data or [],
        "total": response.count or 0,
        "limit": limit,
        "offset": offset,
    }


# --------------------------------------------------
# GET USER BY ID
# --------------------------------------------------


def get_user_by_id(user_id: str) -> dict | None:
    response = (
        supabase.table("users")
        .select("id,name,email,role,is_banned,created_at")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]
