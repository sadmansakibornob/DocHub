from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Request,
    Response,
    status,
)

from app.audit import audit
from app.rbac import require_role
from app.repositories import article_repository as repo
from app.schemas.article_schema import (
    ArticleCreate,
    ArticleResponse,
    ArticleStatus,
    ArticleUpdate,
)
from app.security import get_optional_current_user

router = APIRouter(
    prefix="/api/articles",
    tags=["Articles"],
)


# ============================================================
# GET ALL ARTICLES
# ============================================================


@router.get("/", response_model=list[ArticleResponse])
def get_all_articles(
    category_id: int | None = None,
    article_status: ArticleStatus | None = Query(
        default=None,
        alias="status",
    ),
    current_user: dict | None = Depends(get_optional_current_user),
):
    articles = repo.get_articles(
        category_id=category_id,
        article_status=article_status,
        current_user=current_user,
    )

    return repo.attach_author_names(articles)


# ============================================================
# GET ARTICLE BY ID
# ============================================================


@router.get("/{article_id}", response_model=ArticleResponse)
def get_article(
    article_id: int,
    current_user: dict | None = Depends(get_optional_current_user),
):
    article = repo.get_article_by_id(article_id)

    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    if article["status"] == "published":
        return repo.attach_author_names([article])[0]

    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    is_admin = current_user.get("role") == "admin"
    is_author = str(article["author_id"]) == str(current_user["id"])

    if is_admin or is_author:
        return repo.attach_author_names([article])[0]

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Article not found",
    )


# ============================================================
# CREATE ARTICLE
# ============================================================


@router.post(
    "/",
    response_model=ArticleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_article(
    article: ArticleCreate,
    request: Request,
    current_user: dict = Depends(require_role("user", "admin")),
):
    if article.category_id is not None:
        if not repo.category_exists(article.category_id):
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

    created_article = repo.create_article(article_data)

    if not created_article:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Article creation failed",
        )

    audit(
        current_user["id"],
        "article.create",
        request,
        "article",
        str(created_article["id"]),
    )

    return repo.attach_author_names([created_article])[0]


# ============================================================
# UPDATE ARTICLE
# ============================================================


@router.patch(
    "/{article_id}",
    response_model=ArticleResponse,
)
def update_article(
    article_id: int,
    article: ArticleUpdate,
    request: Request,
    current_user: dict = Depends(require_role("user", "admin")),
):
    current_article = repo.get_article_by_id(article_id)

    if not current_article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    is_admin = current_user.get("role") == "admin"
    is_author = str(current_article["author_id"]) == str(current_user["id"])

    if not is_admin and not is_author:
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

    # Only admins can change article status.
    if "status" in updated_fields:
        new_status = getattr(
            updated_fields["status"],
            "value",
            updated_fields["status"],
        )

        if new_status == current_article["status"]:
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

    if "category_id" in updated_fields and updated_fields["category_id"] is not None:
        if not repo.category_exists(updated_fields["category_id"]):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )

    updated_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

    updated_article = repo.update_article(
        article_id,
        updated_fields,
    )

    if not updated_article:
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

    return repo.attach_author_names([updated_article])[0]


# ============================================================
# DELETE ARTICLE
# ============================================================


@router.delete(
    "/{article_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_article(
    article_id: int,
    request: Request,
    current_user: dict = Depends(require_role("user", "admin")),
):
    article = repo.get_article_by_id(article_id)

    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found",
        )

    is_admin = current_user.get("role") == "admin"
    is_author = str(article["author_id"]) == str(current_user["id"])

    if not is_admin and not is_author:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own articles",
        )

    repo.delete_article(article_id)

    audit(
        current_user["id"],
        "article.delete",
        request,
        "article",
        str(article_id),
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
