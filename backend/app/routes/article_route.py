
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


<<<<<<< Updated upstream
# GET ALL ARTICLES
# Anonymous: Published articles only
# Contributor: Published articles + own articles
# Admin: All articles
=======
# ============================================================
# HELPER: ATTACH AUTHOR NAMES TO ARTICLES
# ============================================================

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
            "author_name": authors.get(
                str(article["author_id"])
            ),
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

>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
    # Anonymous visitors can only see published articles
    if current_user is None:
        query = query.eq("status", "published")

    # Admin can see all articles
    elif current_user["role"] == "admin":
        if article_status is not None:
            query = query.eq("status", article_status)

    # Contributor can see published articles and their own articles
    elif current_user["role"] == "contributor":
=======
    if current_user is None:
        query = query.eq("status", "published")

    elif current_user.get("role") != "admin":
        user_id = str(current_user["id"])

>>>>>>> Stashed changes
        query = query.or_(
            f"status.eq.published,author_id.eq.{user_id}"
        )

<<<<<<< Updated upstream
        if article_status is not None:
            query = query.eq("status", article_status)

    # Other authenticated roles can only see published articles
    else:
        query = query.eq("status", "published")
=======
    if article_status is not None:
        # Prevent anonymous users from requesting drafts.
        if current_user is None and article_status != "published":
            return []

        query = query.eq("status", article_status)
>>>>>>> Stashed changes

    response = (
        query
        .order("created_at", desc=True)
        .execute()
    )

    return response.data


# ============================================================
# GET ARTICLE BY ID
<<<<<<< Updated upstream
# Published articles are public
# Unpublished articles are accessible to their author or admin
=======
#
# Published: Public
# Unpublished: Author or admin only
# ============================================================

>>>>>>> Stashed changes
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
            status_code=404,
            detail="Article not found",
        )

    article = response.data[0]

    if article["status"] == "published":
        return article

    if current_user is None:
        raise HTTPException(
            status_code=404,
            detail="Article not found",
        )

<<<<<<< Updated upstream
    # Admin can access every article
    if current_user["role"] == "admin":
        return article

    # Contributors can access their own articles
    if (
        current_user["role"] == "contributor"
        and str(article["author_id"]) == str(current_user["id"])
    ):
        return article
=======
    is_admin = current_user.get("role") == "admin"

    is_author = (
        str(article["author_id"])
        == str(current_user["id"])
    )

    if is_admin or is_author:
        return attach_author_names([article])[0]
>>>>>>> Stashed changes

    raise HTTPException(
        status_code=404,
        detail="Article not found",
    )


# ============================================================
# CREATE ARTICLE
<<<<<<< Updated upstream
# Contributor and admin
=======
#
# Regular users and admins can create articles.
# New articles always start as drafts.
# ============================================================

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

    # Validate category if provided
=======
>>>>>>> Stashed changes
    if article.category_id is not None:

        category = (
            supabase.table("categories")
            .select("id")
            .eq("id", article.category_id)
            .execute()
        )

        if not category.data:
            raise HTTPException(
                status_code=404,
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
            status_code=400,
            detail="Article creation failed",
        )

<<<<<<< Updated upstream
    return response.data[0]
=======
    created_article = response.data[0]

    audit(
        current_user["id"],
        "article.create",
        request,
        "article",
        str(created_article["id"]),
    )

    return attach_author_names([created_article])[0]
>>>>>>> Stashed changes


# ============================================================
# UPDATE ARTICLE
<<<<<<< Updated upstream
# Contributors can update their own articles
# Admins can update all articles
@router.patch("/{article_id}", response_model=ArticleResponse)
=======
#
# Author: Can edit own content and category.
# Admin: Can edit any article and change its status.
# Other users: Cannot edit.
#
# Sending the existing status is allowed.
# Changing the actual status is admin-only.
# ============================================================

@router.patch(
    "/{article_id}",
    response_model=ArticleResponse,
)
>>>>>>> Stashed changes
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
            status_code=404,
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
            status_code=403,
            detail="You can only update your own articles",
        )

    updated_fields = article.model_dump(
        exclude_unset=True
    )

    if not updated_fields:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update",
        )

    # Handle status separately.
    if "status" in updated_fields:
        new_status = updated_fields["status"]

        # Pydantic enums may need conversion to their string value.
        if hasattr(new_status, "value"):
            new_status = new_status.value
            
        if new_status == current_article["status"]:
            # Existing status is unchanged; no admin permission needed.
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
<<<<<<< Updated upstream
            status_code=403,
            detail="Only admins can change article status",
=======
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No editable changes provided",
>>>>>>> Stashed changes
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
                status_code=404,
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
            status_code=400,
            detail="Article update failed",
        )

<<<<<<< Updated upstream
    return response.data[0]
=======
    audit(
        current_user["id"],
        "article.update",
        request,
        "article",
        str(article_id),
    )

    return attach_author_names(response.data)[0]
>>>>>>> Stashed changes


# ============================================================
# DELETE ARTICLE
<<<<<<< Updated upstream
# Contributors can delete their own articles
# Admins can delete all articles
=======
#
# Author: Can delete own articles.
# Admin: Can delete any article.
# ============================================================

>>>>>>> Stashed changes
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
            status_code=404,
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
            status_code=403,
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
