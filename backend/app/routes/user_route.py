from fastapi import APIRouter, Depends, HTTPException, Query
from app.db import supabase
from app.security import get_current_user
from app.rbac import require_role

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    return user

@router.get("/")
def list_users(limit: int = Query(25, ge=1, le=100), offset: int = Query(0, ge=0), _: dict = Depends(require_role("admin"))):
    result = supabase.table("users").select("id,name,email,role,is_banned,created_at", count="exact").order("name").range(offset, offset + limit - 1).execute()
    return {"items": result.data or [], "total": result.count or 0, "limit": limit, "offset": offset}

@router.get("/{user_id}")
def get_user(user_id: str, _: dict = Depends(require_role("admin"))):
    rows = supabase.table("users").select("id,name,email,role,is_banned,created_at").eq("id", user_id).limit(1).execute().data
    if not rows: raise HTTPException(404, "User not found")
    return rows[0]
