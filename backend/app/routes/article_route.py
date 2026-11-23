from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Response,
    Query,
    Request,
)

from app.db import supabase
from app.security import get_optional_current_user
from app.rbac import require_role
from app.audit import audit
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


# ============================================================
# HELPER: ATTACH AUTHOR NAMES TO ARTICLES
# ============================================================

def attach_author_names(articles: list[dict]) -> list[dict]:
    if not articles:
        return []

    author_ids = list({
        str(article["author_id"])
        for article in articles
        if article.get("author_id") is not None
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
            "author_name": authors.get(
                str(article["author_id"])
            ) if article.get("author_id") is not None else None,
        }
        for article in articles
    ]


# ============================================================
# GET ALL ARTICLES
#
# Anonymous: Published articles only
# Regular users: Published articles + own unpublished articles
# Admin: All articles
# ============================================================

@router.get("/", response_model=list[ArticleResponse])
def get_all_articles(
    category_id: int | None = None,
    article_status: ArticleStatus | None = Query(
        default=None,
        alias="status",
    ),
    current_user: dict | None = Depends(
        get_optional_current_user
    ),
):
    query = supabase.table("articles").select("*")

    if category_id is not None:
        query = query.eq("category_id", category_id)

    if current_user is None:
        query = query.eq("status", "published")

    elif current_user.get("role") != "admin":
        user_id = str(current_user["id"])

        query = query.or_(
            f"status.eq.published,author_id.eq.{user_id}"
        )

    # Optional status filter
    if article_status is not None:
        requested_status = (
            article_status.value
            if hasattr(article_status, "value")
            else article_status
        )

        # Anonymous visitors cannot request unpublished articles.
        if current_user is None and requested_status != "published":
            return []

        query = query.eq("status", requested_status)

    response = (
        query
        .order("created_at", desc=True)
        .execute()
    )

    return attach_author_names(response.data or [])


# ============================================================
# GET ARTICLE BY ID
#
# Published: Public
# Unpublished: Author or admin only
# ============================================================

@router.get("/{article_id}", response_model=ArticleResponse)
def get_article(
    article_id: int,
    current_user: dict | None = Depends(
        get_optional_current_user
    ),
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

    if article["status"] == "published":
        return attach_author_names([article])[0]

    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    is_admin = current_user.get("role") == "admin"

    is_author = (
        str(article["author_id"])
        == str(current_user["id"])
    )

    if is_admin or is_author:
        return attach_author_names([article])[0]

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Article not found",
    )


# ============================================================
# CREATE ARTICLE
#
# Regular users and admins can create articles.
# New articles always start as drafts.
# ============================================================

@router.post(
    "/",
    response_model=ArticleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_article(
    article: ArticleCreate,
    request: Request,
    current_user: dict = Depends(
        require_role("user", "admin")
    ),
):
    # Validate category if provided.
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
        .select("*")
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Article creation failed",
        )

    created_article = response.data[0]

    audit(
        current_user["id"],
        "article.create",
        request,
        "article",
        str(created_article["id"]),
    )

    return attach_author_names([created_article])[0]


# ============================================================
# UPDATE ARTICLE
#
# Author: Can edit own content and category.
# Admin: Can edit any article and change its status.
# Other users: Cannot edit.
# ============================================================

@router.patch(
    "/{article_id}",
    response_model=ArticleResponse,
)
def update_article(
    article_id: int,
    article: ArticleUpdate,
    request: Request,
    current_user: dict = Depends(
        require_role("user", "admin")
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

    is_admin = current_user.get("role") == "admin"

    is_author = (
        str(current_article["author_id"])
        == str(current_user["id"])
    )

    if not is_admin and not is_author:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own articles",
        )

    updated_fields = article.model_dump(
        exclude_unset=True
    )

    if not updated_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    # Handle status separately.
    if "status" in updated_fields:
        new_status = updated_fields["status"]

        if hasattr(new_status, "value"):
            new_status = new_status.value

        if new_status == current_article["status"]:
            # Unchanged status does not require admin permission.
            updated_fields.pop("status")

        elif not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can change article status",
            )
        else:
            updated_fields["status"] = new_status

    if not updated_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No editable changes provided",
        )

    # Validate category.
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
        .select("*")
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Article update failed",
        )

    audit(
        current_user["id"],
        "article.update",
        request,
        "article",
        str(article_id),
    )

    return attach_author_names(response.data)[0]


# ============================================================
# DELETE ARTICLE
#
# Author: Can delete own articles.
# Admin: Can delete any article.
# ============================================================

@router.delete(
    "/{article_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_article(
    article_id: int,
    request: Request,
    current_user: dict = Depends(
        require_role("user", "admin")
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

    is_admin = current_user.get("role") == "admin"

    is_author = (
        str(article["author_id"])
        == str(current_user["id"])
    )

    if not is_admin and not is_author:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own articles",
        )

    supabase.table("articles").delete().eq(
        "id", article_id
    ).execute()

    audit(
        current_user["id"],
        "article.delete",
        request,
        "article",
        str(article_id),
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )
