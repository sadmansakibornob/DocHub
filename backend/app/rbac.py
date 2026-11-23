from enum import StrEnum
from fastapi import Depends, HTTPException
from app.security import get_current_user

class Permission(StrEnum):
    ARTICLE_READ = "articles:read"
    ARTICLE_CREATE = "articles:create"
    ARTICLE_UPDATE_OWN = "articles:update:own"
    ARTICLE_DELETE_OWN = "articles:delete:own"
    ARTICLE_MODERATE = "articles:moderate"
    USERS_MANAGE = "users:manage"
    GROUP_CREATE = "groups:create"
    GROUP_UPDATE = "groups:update"
    GROUP_ASSIGN = "groups:assign"

ROLE_PERMISSIONS = {
    "user": {Permission.ARTICLE_READ, Permission.ARTICLE_CREATE,
             Permission.ARTICLE_UPDATE_OWN, Permission.ARTICLE_DELETE_OWN,
             Permission.GROUP_CREATE},
    "admin": set(Permission),
}

def require_permission(permission: Permission):
    def dependency(user: dict = Depends(get_current_user)) -> dict:
        if permission not in ROLE_PERMISSIONS.get(user.get("role"), set()):
            raise HTTPException(403, "Insufficient permission")
        return user
    return dependency

def require_role(*roles: str):
    def dependency(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in roles:
            raise HTTPException(403, "Insufficient role")
        return user
    return dependency
