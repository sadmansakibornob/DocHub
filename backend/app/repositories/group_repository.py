from app.db import supabase

# --------------------------------------------------
# GROUPS
# --------------------------------------------------


def create_group(group_data: dict) -> dict | None:
    response = supabase.table("groups").insert(group_data).select("*").execute()

    return response.data[0] if response.data else None


def get_group_by_id(group_id: str) -> dict | None:
    response = (
        supabase.table("groups").select("*").eq("id", group_id).limit(1).execute()
    )

    return response.data[0] if response.data else None


def get_user_memberships(user_id: str) -> list[dict]:
    response = (
        supabase.table("group_members")
        .select("group_id,role")
        .eq("user_id", user_id)
        .execute()
    )

    return response.data or []


def get_owned_groups(user_id: str) -> list[dict]:
    response = supabase.table("groups").select("id").eq("owner_id", user_id).execute()

    return response.data or []


def get_groups_by_ids(group_ids: list[str]) -> list[dict]:
    if not group_ids:
        return []

    response = (
        supabase.table("groups")
        .select("*")
        .in_("id", group_ids)
        .order("created_at", desc=True)
        .execute()
    )

    return response.data or []


def update_group(group_id: str, fields: dict) -> dict | None:
    response = (
        supabase.table("groups").update(fields).eq("id", group_id).select("*").execute()
    )

    return response.data[0] if response.data else None


def delete_group(group_id: str) -> None:
    supabase.table("groups").delete().eq("id", group_id).execute()


# --------------------------------------------------
# GROUP MEMBERSHIPS
# --------------------------------------------------


def get_group_membership(group_id: str, user_id: str) -> dict | None:
    response = (
        supabase.table("group_members")
        .select("role")
        .eq("group_id", group_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )

    return response.data[0] if response.data else None


def add_or_restore_membership(
    group_id: str,
    user_id: str,
    role: str,
) -> dict | None:
    response = (
        supabase.table("group_members")
        .upsert(
            {
                "group_id": group_id,
                "user_id": user_id,
                "role": role,
            },
            on_conflict="group_id,user_id",
        )
        .select("*")
        .execute()
    )

    return response.data[0] if response.data else None


def list_group_members(group_id: str) -> list[dict]:
    response = (
        supabase.table("group_members")
        .select("group_id,user_id,role,created_at,users(id,name,email)")
        .eq("group_id", group_id)
        .execute()
    )

    return response.data or []


def find_user_by_email(email: str) -> dict | None:
    response = (
        supabase.table("users")
        .select("id,email")
        .ilike("email", email)
        .limit(1)
        .execute()
    )

    return response.data[0] if response.data else None


def get_member(group_id: str, user_id: str) -> dict | None:
    response = (
        supabase.table("group_members")
        .select("role")
        .eq("group_id", group_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )

    return response.data[0] if response.data else None


def create_membership(
    group_id: str,
    user_id: str,
    role: str,
) -> dict | None:
    response = (
        supabase.table("group_members")
        .insert(
            {
                "group_id": group_id,
                "user_id": user_id,
                "role": role,
            }
        )
        .select("*")
        .execute()
    )

    return response.data[0] if response.data else None


def update_member_role(
    group_id: str,
    user_id: str,
    role: str,
) -> dict | None:
    response = (
        supabase.table("group_members")
        .update({"role": role})
        .eq("group_id", group_id)
        .eq("user_id", user_id)
        .select("*")
        .execute()
    )

    return response.data[0] if response.data else None


def delete_member(group_id: str, user_id: str) -> None:
    (
        supabase.table("group_members")
        .delete()
        .eq("group_id", group_id)
        .eq("user_id", user_id)
        .execute()
    )


# --------------------------------------------------
# GROUP ARTICLES
# --------------------------------------------------


def get_group_article_links(group_id: str) -> list[dict]:
    response = (
        supabase.table("group_articles")
        .select("article_id")
        .eq("group_id", group_id)
        .execute()
    )

    return response.data or []


def get_articles_by_ids(article_ids: list[int]) -> list[dict]:
    if not article_ids:
        return []

    response = (
        supabase.table("articles")
        .select("*")
        .in_("id", article_ids)
        .order("created_at", desc=True)
        .execute()
    )

    return response.data or []


def get_article_for_assignment(article_id: int) -> dict | None:
    response = (
        supabase.table("articles")
        .select("id,author_id")
        .eq("id", article_id)
        .limit(1)
        .execute()
    )

    return response.data[0] if response.data else None


def assign_article(
    group_id: str,
    article_id: int,
    assigned_by: str,
) -> dict | None:
    response = (
        supabase.table("group_articles")
        .upsert(
            {
                "group_id": group_id,
                "article_id": article_id,
                "assigned_by": assigned_by,
            },
            on_conflict="group_id,article_id",
        )
        .select("*")
        .execute()
    )

    return response.data[0] if response.data else None


def get_group_article_assignment(
    group_id: str,
    article_id: int,
) -> dict | None:
    response = (
        supabase.table("group_articles")
        .select("article_id")
        .eq("group_id", group_id)
        .eq("article_id", article_id)
        .limit(1)
        .execute()
    )

    return response.data[0] if response.data else None


def remove_group_article(group_id: str, article_id: int) -> list[dict]:
    response = (
        supabase.table("group_articles")
        .delete()
        .eq("group_id", group_id)
        .eq("article_id", article_id)
        .select("article_id")
        .execute()
    )

    return response.data or []


# --------------------------------------------------
# ARTICLES
# --------------------------------------------------


def get_article_by_id(article_id: int) -> dict | None:
    response = (
        supabase.table("articles").select("*").eq("id", article_id).limit(1).execute()
    )

    return response.data[0] if response.data else None


def category_exists(category_id: int) -> bool:
    response = (
        supabase.table("categories")
        .select("id")
        .eq("id", category_id)
        .limit(1)
        .execute()
    )

    return bool(response.data)


def update_article(article_id: int, fields: dict) -> dict | None:
    response = (
        supabase.table("articles")
        .update(fields)
        .eq("id", article_id)
        .select("*")
        .execute()
    )

    return response.data[0] if response.data else None
