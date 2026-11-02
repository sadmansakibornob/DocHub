from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status, Response
from supabase import create_client

from app.db import supabase, SUPABASE_URL, SUPABASE_ANON_KEY
from app.security import get_current_user, require_role
from app.schemas.user_schema import (
    UserCreate,
    UserLogin,
    UserUpdate,
    UserResponse,
)

router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
)


# REGISTER CONTRIBUTOR
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate):

    auth_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    auth_user_id = None

    try:
        auth_response = auth_client.auth.sign_up({
            "email": user.email,
            "password": user.password,
        })

        if not auth_response.user:
            raise HTTPException(
                status_code=400,
                detail="Registration failed",
            )

        auth_user_id = str(auth_response.user.id)

        response = supabase.table("users").insert({
            "id": auth_user_id,
            "name": user.name,
            "email": user.email,
            "role": "contributor",
        }).execute()

        return {
            "message": "Contributor registration successful",
            "user": response.data[0],
        }

    except HTTPException:
        if auth_user_id:
            try:
                supabase.auth.admin.delete_user(auth_user_id)
            except Exception:
                pass
        raise

    except Exception as e:
        print("REGISTRATION ERROR:", repr(e))

        if auth_user_id:
            try:
                supabase.auth.admin.delete_user(auth_user_id)
            except Exception:
                pass

        raise HTTPException(
            status_code=400,
            detail="Registration failed. Check the email or try again.",
        )


# LOGIN
@router.post("/login")
def login_user(credentials: UserLogin):

    auth_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

    try:
        auth_response = auth_client.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password,
        })

        if not auth_response.session or not auth_response.user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )

        response = (
            supabase.table("users")
            .select("*")
            .eq("id", str(auth_response.user.id))
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="User profile not found",
            )

        return {
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "token_type": "bearer",
            "user": response.data[0],
        }

    except HTTPException:
        raise

    except Exception as e:
        print("LOGIN ERROR:", repr(e))

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )


# GET CURRENT USER
@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: dict = Depends(get_current_user),
):
    return current_user


# GET ALL USERS (ADMIN)
@router.get("/", response_model=list[UserResponse])
def get_all_users(
    current_user: dict = Depends(require_role("admin")),
):

    response = (
        supabase.table("users")
        .select("*")
        .order("name")
        .execute()
    )

    return response.data


# GET USER BY ID (ADMIN)
@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: str,
    current_user: dict = Depends(require_role("admin")),
):

    response = (
        supabase.table("users")
        .select("*")
        .eq("id", user_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return response.data[0]


# UPDATE USER (ADMIN)
@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    user: UserUpdate,
    current_user: dict = Depends(require_role("admin")),
):

    updated_fields = user.model_dump(exclude_unset=True)

    if not updated_fields:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update",
        )

    # Check whether the user exists
    existing = (
        supabase.table("users")
        .select("*")
        .eq("id", user_id)
        .execute()
    )

    if not existing.data:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    # Protect the last administrator
    if (
        existing.data[0]["role"] == "admin"
        and updated_fields.get("role") not in (None, "admin")
    ):
        admins = (
            supabase.table("users")
            .select("id")
            .eq("role", "admin")
            .execute()
        )

        if len(admins.data) <= 1:
            raise HTTPException(
                status_code=400,
                detail="Cannot demote the last administrator",
            )

    updated_fields["updated_at"] = datetime.now(
        timezone.utc
    ).isoformat()

    response = (
        supabase.table("users")
        .update(updated_fields)
        .eq("id", user_id)
        .execute()
    )

    return response.data[0]


# DELETE USER (ADMIN)
@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_user(
    user_id: str,
    current_user: dict = Depends(require_role("admin")),
):

    if str(current_user["id"]) == user_id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account",
        )

    # Check whether the user exists
    existing = (
        supabase.table("users")
        .select("*")
        .eq("id", user_id)
        .execute()
    )

    if not existing.data:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    # Protect the last administrator
    if existing.data[0]["role"] == "admin":

        admins = (
            supabase.table("users")
            .select("id")
            .eq("role", "admin")
            .execute()
        )

        if len(admins.data) <= 1:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete the last administrator",
            )

    try:
        supabase.auth.admin.delete_user(user_id)

    except Exception as e:
        print("USER DELETION ERROR:", repr(e))

        raise HTTPException(
            status_code=400,
            detail="User deletion failed",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
