from app.db import supabase

# --------------------------------------------------
# GET CATEGORIES
# --------------------------------------------------


def get_all_categories() -> list[dict]:
    response = supabase.table("categories").select("*").order("name").execute()

    return response.data or []


def get_category_by_id(category_id: int) -> dict | None:
    response = (
        supabase.table("categories")
        .select("*")
        .eq("id", category_id)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


# --------------------------------------------------
# CREATE CATEGORY
# --------------------------------------------------


def create_category(category_data: dict) -> dict | None:
    response = supabase.table("categories").insert(category_data).select("*").execute()

    if not response.data:
        return None

    return response.data[0]


# --------------------------------------------------
# UPDATE CATEGORY
# --------------------------------------------------


def update_category(
    category_id: int,
    updated_fields: dict,
) -> dict | None:
    response = (
        supabase.table("categories")
        .update(updated_fields)
        .eq("id", category_id)
        .select("*")
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


# --------------------------------------------------
# DELETE CATEGORY
# --------------------------------------------------


def category_has_articles(category_id: int) -> bool:
    response = (
        supabase.table("articles")
        .select("id")
        .eq("category_id", category_id)
        .limit(1)
        .execute()
    )

    return bool(response.data)


def delete_category(category_id: int) -> bool:
    response = supabase.table("categories").delete().eq("id", category_id).execute()

    return bool(response.data)
