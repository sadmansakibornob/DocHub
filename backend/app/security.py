from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.db import supabase


# Authentication scheme
security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)


# GET CURRENT USER
# Requires a valid access token
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    try:
        auth_response = supabase.auth.get_user(token)
        auth_user = auth_response.user

        if not auth_user:
            raise ValueError("User not found")

        response = (
            supabase.table("users")
            .select("*")
            .eq("id", str(auth_user.id))
            .execute()
        )

        if not response.data:
            raise ValueError("User profile not found")

        return response.data[0]

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# GET OPTIONAL CURRENT USER
# Allows anonymous visitors
# Validates the token if one is provided
def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        optional_security
    ),
):
    # Anonymous visitor
    if credentials is None:
        return None

    token = credentials.credentials

    try:
        auth_response = supabase.auth.get_user(token)
        auth_user = auth_response.user

        if not auth_user:
            raise ValueError("User not found")

        response = (
            supabase.table("users")
            .select("*")
            .eq("id", str(auth_user.id))
            .execute()
        )

        if not response.data:
            raise ValueError("User profile not found")

        return response.data[0]

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ROLE-BASED AUTHORIZATION
# Checks whether the authenticated user has an allowed role
def require_role(*allowed_roles):
    def role_checker(
        current_user: dict = Depends(get_current_user),
    ):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )

        return current_user

    return role_checker
