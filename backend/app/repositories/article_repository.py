from datetime import datetime, timezone

from app.db import supabase


def now_utc():
    return datetime.now(timezone.utc).isoformat()


# ============================================================
# AUTHOR QUERIES
# ============================================================


def get_author_names(author_ids: list[str]) -> dict:
    if not author_ids:
        return {}

    response = supabase.table("users").select("id,name").in_("id", author_ids).execute()

    return {str(author["id"]): author.get("name") for author in (response.data or [])}


# ============================================================
# ARTICLE QUERIES
# ============================================================


def get_articles(
    category_id=None,
    article_status=None,
    current_user=None,
):
    query = supabase.table("articles").select("*")

    if category_id is not None:
        query = query.eq("category_id", category_id)

    if current_user is None:
        query = query.eq("status", "published")

    elif current_user.get("role") != "admin":
        user_id = str(current_user["id"])
        query = query.or_(f"status.eq.published,author_id.eq.{user_id}")

    if article_status is not None:
        requested_status = getattr(
            article_status,
            "value",
            article_status,
        )

        if current_user is None and requested_status != "published":
            return []

        query = query.eq("status", requested_status)

    response = query.order("created_at", desc=True).execute()

    return response.data or []


def get_article_by_id(article_id: int):
    response = supabase.table("articles").select("*").eq("id", article_id).execute()

    if not response.data:
        return None

    return response.data[0]


def create_article(article_data: dict):
    response = supabase.table("articles").insert(article_data).select("*").execute()

    if not response.data:
        return None

    return response.data[0]


def update_article(article_id: int, updated_fields: dict):
    response = (
        supabase.table("articles")
        .update(updated_fields)
        .eq("id", article_id)
        .select("*")
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


def delete_article(article_id: int):
    return supabase.table("articles").delete().eq("id", article_id).execute()


# ============================================================
# CATEGORY QUERIES
# ============================================================


def category_exists(category_id: int) -> bool:
    response = supabase.table("categories").select("id").eq("id", category_id).execute()

    return bool(response.data)


# ============================================================
# AUTHOR NAME ATTACHMENT
# ============================================================


def attach_author_names(articles: list[dict]) -> list[dict]:
    if not articles:
        return []

    author_ids = list(
        {
            str(article["author_id"])
            for article in articles
            if article.get("author_id") is not None
        }
    )

    authors = get_author_names(author_ids)

    return [
        {
            **article,
            "author_name": authors.get(str(article["author_id"]))
            if article.get("author_id") is not None
            else None,
        }
        for article in articles
    ]
