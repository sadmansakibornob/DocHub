from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status, Response

from app.db import supabase
from app.security import require_role
from app.schemas.category_schema import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
)

router = APIRouter(
    prefix="/api/categories",
    tags=["Categories"],
)


# GET ALL CATEGORIES
# Public endpoint
@router.get("/", response_model=list[CategoryResponse])
def get_all_categories():
    response = (
        supabase.table("categories")
        .select("*")
        .order("name")
        .execute()
    )

    return response.data


# GET CATEGORY BY ID
# Public endpoint
@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int):
    response = (
        supabase.table("categories")
        .select("*")
        .eq("id", category_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return response.data[0]


# CREATE CATEGORY
# Admin only
@router.post(
    "/",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    category: CategoryCreate,
    current_user: dict = Depends(require_role("admin")),
):
    response = (
        supabase.table("categories")
        .insert(category.model_dump())
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category creation failed",
        )

    return response.data[0]


# UPDATE CATEGORY
# Admin only
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

    response = (
        supabase.table("categories")
        .update(updated_fields)
        .eq("id", category_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return response.data[0]


# DELETE CATEGORY
# Admin only
@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_category(
    category_id: int,
    current_user: dict = Depends(require_role("admin")),
):
    # Check whether articles are using this category
    articles = (
        supabase.table("articles")
        .select("id")
        .eq("category_id", category_id)
        .limit(1)
        .execute()
    )

    if articles.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete a category that is assigned to articles",
        )

    response = (
        supabase.table("categories")
        .delete()
        .eq("id", category_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
