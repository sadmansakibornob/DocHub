from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status, Response

from app.db import supabase
from app.security import (
    get_optional_current_user,
    require_role,
)
from app.schemas.article_schema import (
    ArticleCreate,
    ArticleUpdate,
    ArticleResponse,
    ArticleStatus,
)

router = APIRouter(
    prefix="/api/articles",
    tags=["Articles"],
)


# HELPER: ATTACH AUTHOR NAMES TO ARTICLES
def attach_author_names(articles: list[dict]) -> list[dict]:
    if not articles:
        return []

    author_ids = list({
        str(article["author_id"])
        for article in articles
        if article.get("author_id")
    })

    if not author_ids:
        return [
            {**article, "author_name": None}
            for article in articles
        ]

    response = (
        supabase.table("users")
        .select("id, name")
        .in_("id", author_ids)
        .execute()
    )

    authors = {
        str(author["id"]): author.get("name")
        for author in (response.data or [])
    }

    return [
        {
            **article,
            "author_name": authors.get(str(article["author_id"])),
        }
        for article in articles
    ]


# GET ALL ARTICLES
# Anonymous / Reader: Published articles only
# Contributor: All published articles + own unpublished articles
# Admin: All articles

@router.get("/", response_model=list[ArticleResponse])
def get_all_articles(
    category_id: int | None = None,
    article_status: ArticleStatus | None = None,
    current_user: dict | None = Depends(get_optional_current_user),
):
    query = supabase.table("articles").select("*")

    # Filter by category
    if category_id is not None:
        query = query.eq("category_id", category_id)

    # Anonymous visitors and readers can only see published articles
    if current_user is None or current_user["role"] == "reader":
        query = query.eq("status", "published")

    # Admin can see all articles
    elif current_user["role"] == "admin":
        pass

    # Contributors can see all published articles
    # and their own drafts / articles under review
    elif current_user["role"] == "contributor":
        query = query.or_(
            f"status.eq.published,author_id.eq.{current_user['id']}"
        )

    # Any unrecognized role gets published articles only
    else:
        query = query.eq("status", "published")

    # Optional status filter
    if article_status is not None:
        query = query.eq("status", article_status)

    response = (
        query
        .order("created_at", desc=True)
        .execute()
    )

    return attach_author_names(response.data or [])


# GET ARTICLE BY ID
# Published articles are public
# Unpublished articles are accessible to their author or admin

@router.get("/{article_id}", response_model=ArticleResponse)
def get_article(
    article_id: int,
    current_user: dict | None = Depends(get_optional_current_user),
):
    response = (
        supabase.table("articles")
        .select("*")
        .eq("id", article_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    article = response.data[0]

    # Published articles are publicly accessible
    if article["status"] == "published":
        return attach_author_names([article])[0]

    # Unpublished articles require authentication
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    # Admin can access every article
    if current_user["role"] == "admin":
        return attach_author_names([article])[0]

    # Contributors can access their own articles
    if (
        current_user["role"] == "contributor"
        and str(article["author_id"]) == str(current_user["id"])
    ):
        return attach_author_names([article])[0]

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Article not found",
    )


# CREATE ARTICLE
# Contributor and admin

@router.post(
    "/",
    response_model=ArticleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_article(
    article: ArticleCreate,
    current_user: dict = Depends(
        require_role("contributor", "admin")
    ),
):
    # Validate category if provided
    if article.category_id is not None:
        category = (
            supabase.table("categories")
            .select("id")
            .eq("id", article.category_id)
            .execute()
        )

        if not category.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )

    article_data = {
        "title": article.title,
        "content": article.content,
        "category_id": article.category_id,
        "author_id": current_user["id"],
        "status": "draft",
    }

    response = (
        supabase.table("articles")
        .insert(article_data)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Article creation failed",
        )

    return attach_author_names(response.data)[0]


# UPDATE ARTICLE
# Contributors can update their own articles
# Admins can update all articles

@router.patch("/{article_id}", response_model=ArticleResponse)
def update_article(
    article_id: int,
    article: ArticleUpdate,
    current_user: dict = Depends(
        require_role("contributor", "admin")
    ),
):
    existing = (
        supabase.table("articles")
        .select("*")
        .eq("id", article_id)
        .execute()
    )

    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    current_article = existing.data[0]

    # Contributors can only update their own articles
    if (
        current_user["role"] != "admin"
        and str(current_article["author_id"]) != str(current_user["id"])
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own articles",
        )

    updated_fields = article.model_dump(exclude_unset=True)

    if not updated_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    # Only admins can change article status
    if (
        current_user["role"] != "admin"
        and "status" in updated_fields
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can change article status",
        )

    # Validate category if being updated
    if (
        "category_id" in updated_fields
        and updated_fields["category_id"] is not None
    ):
        category = (
            supabase.table("categories")
            .select("id")
            .eq("id", updated_fields["category_id"])
            .execute()
        )

        if not category.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )

    updated_fields["updated_at"] = datetime.now(
        timezone.utc
    ).isoformat()

    response = (
        supabase.table("articles")
        .update(updated_fields)
        .eq("id", article_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Article update failed",
        )

    return attach_author_names(response.data)[0]


# DELETE ARTICLE
# Contributors can delete their own articles
# Admins can delete all articles

@router.delete(
    "/{article_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_article(
    article_id: int,
    current_user: dict = Depends(
        require_role("contributor", "admin")
    ),
):
    existing = (
        supabase.table("articles")
        .select("*")
        .eq("id", article_id)
        .execute()
    )

    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    article = existing.data[0]

    # Contributors can only delete their own articles
    if (
        current_user["role"] != "admin"
        and str(article["author_id"]) != str(current_user["id"])
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own articles",
        )

    supabase.table("articles").delete().eq(
        "id", article_id
    ).execute()

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )
