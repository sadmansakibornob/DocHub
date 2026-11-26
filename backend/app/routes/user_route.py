from fastapi import APIRouter, Depends, HTTPException, Query

from app.rbac import require_role
from app.repositories import user_repository as user_repo
from app.security import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])


# --------------------------------------------------
# GET CURRENT USER
# Authenticated users
# --------------------------------------------------


@router.get("/me")
def get_me(
    user: dict = Depends(get_current_user),
):
    return user


# --------------------------------------------------
# LIST USERS
# Admin only
# --------------------------------------------------


@router.get("/")
def list_users(
    limit: int = Query(25, ge=1, le=100),
    offset: int = Query(0, ge=0),
    _: dict = Depends(require_role("admin")),
):
    return user_repo.get_users(
        limit=limit,
        offset=offset,
    )


# --------------------------------------------------
# GET USER BY ID
# Admin only
# --------------------------------------------------


@router.get("/{user_id}")
def get_user(
    user_id: str,
    _: dict = Depends(require_role("admin")),
):
    user = user_repo.get_user_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user
