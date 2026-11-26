from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.rbac import require_role
from app.repositories import category_repository as category_repo
from app.schemas.category_schema import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
)

router = APIRouter(
    prefix="/api/categories",
    tags=["Categories"],
)


# --------------------------------------------------
# GET ALL CATEGORIES
# Public endpoint
# --------------------------------------------------


@router.get("/", response_model=list[CategoryResponse])
def get_all_categories():
    return category_repo.get_all_categories()


# --------------------------------------------------
# GET CATEGORY BY ID
# Public endpoint
# --------------------------------------------------


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int):
    category = category_repo.get_category_by_id(category_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return category


# --------------------------------------------------
# CREATE CATEGORY
# Admin only
# --------------------------------------------------


@router.post(
    "/",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    category: CategoryCreate,
    current_user: dict = Depends(require_role("admin")),
):
    created = category_repo.create_category(category.model_dump())

    if not created:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category creation failed",
        )

    return created


# --------------------------------------------------
# UPDATE CATEGORY
# Admin only
# --------------------------------------------------


@router.patch("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category: CategoryUpdate,
    current_user: dict = Depends(require_role("admin")),
):
    updated_fields = category.model_dump(exclude_unset=True)

    if not updated_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    updated_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

    updated = category_repo.update_category(
        category_id,
        updated_fields,
    )

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return updated


# --------------------------------------------------
# DELETE CATEGORY
# Admin only
# --------------------------------------------------


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_category(
    category_id: int,
    current_user: dict = Depends(require_role("admin")),
):
    # Prevent deletion if articles use this category.
    if category_repo.category_has_articles(category_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete a category that is assigned to articles",
        )

    deleted = category_repo.delete_category(category_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
