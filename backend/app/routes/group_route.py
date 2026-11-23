from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from app.db import supabase
from app.security import get_current_user
from app.audit import audit
from app.schemas.article_schema import ArticleUpdate

router = APIRouter(prefix="/api/groups", tags=["Groups"])
class GroupCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=1000)
class ArticleAssign(BaseModel):
    article_id: int

class MemberAdd(BaseModel):
    user_id: str
    role: str = Field(default="member", pattern=r"^(member|editor)$")
class MemberRoleUpdate(BaseModel):
    role: str = Field(pattern=r"^(member|editor)$")

def _group(group_id: str, user: dict) -> tuple[dict, str]:
    rows = supabase.table("groups").select("*").eq("id", group_id).limit(1).execute().data or []
    if not rows: raise HTTPException(404, "Group not found")
    memberships = supabase.table("group_members").select("role").eq("group_id", group_id).eq("user_id", user["id"]).limit(1).execute().data or []
    if not memberships: raise HTTPException(404, "Group not found")
    return rows[0], memberships[0]["role"]

def _owner(group_id: str, user: dict) -> dict:
    group, role = _group(group_id, user)
    if group["owner_id"] != user["id"] or role != "owner": raise HTTPException(403, "Only the group owner can manage this group")
    return group

@router.post("", status_code=201)
def create_group(payload: GroupCreate, user: dict = Depends(get_current_user)):
    row = supabase.table("groups").insert({"name": payload.name.strip(), "description": payload.description, "owner_id": user["id"]}).select("*").execute().data[0]
    supabase.table("group_members").upsert({"group_id": row["id"], "user_id": user["id"], "role": "owner"}, on_conflict="group_id,user_id").execute()
    return row

@router.get("")
def list_groups(user: dict = Depends(get_current_user)):
    ids = [x["group_id"] for x in (supabase.table("group_members").select("group_id").eq("user_id", user["id"]).execute().data or [])]
    if not ids: return []
    return supabase.table("groups").select("*").in_("id", ids).order("created_at", desc=True).execute().data

@router.get("/{group_id}")
def get_group(group_id: str, user: dict = Depends(get_current_user)):
    group, role = _group(group_id, user)
    return {**group, "membership_role": role}

@router.patch("/{group_id}")
def rename_group(group_id: str, payload: GroupCreate, user: dict = Depends(get_current_user)):
    _owner(group_id, user)
    return supabase.table("groups").update({"name": payload.name.strip(), "description": payload.description, "updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", group_id).select("*").execute().data[0]

@router.delete("/{group_id}", status_code=204)
def delete_group(group_id: str, user: dict = Depends(get_current_user)):
    _owner(group_id, user)
    supabase.table("groups").delete().eq("id", group_id).execute()

@router.get("/{group_id}/members")
def list_members(group_id: str, user: dict = Depends(get_current_user)):
    _group(group_id, user)
    return supabase.table("group_members").select("group_id,user_id,role,created_at,users(id,name,email)").eq("group_id", group_id).execute().data

@router.post("/{group_id}/members", status_code=201)
def add_member(group_id: str, payload: MemberAdd, request: Request, user: dict = Depends(get_current_user)):
    _owner(group_id, user)
    target = supabase.table("users").select("id").eq("id", payload.user_id).limit(1).execute().data
    if not target: raise HTTPException(404, "User not found")
    row = supabase.table("group_members").upsert({"group_id": group_id, "user_id": payload.user_id, "role": payload.role}, on_conflict="group_id,user_id").select("*").execute().data[0]
    audit(user["id"], "group.member.add", request, "group", group_id, {"member_id": payload.user_id, "role": payload.role})
    return row

@router.patch("/{group_id}/members/{member_id}")
def update_member_role(group_id: str, member_id: str, payload: MemberRoleUpdate, user: dict = Depends(get_current_user)):
    _owner(group_id, user)
    if member_id == user["id"]: raise HTTPException(400, "Owner role cannot be changed")
    rows = supabase.table("group_members").update({"role": payload.role}).eq("group_id", group_id).eq("user_id", member_id).select("*").execute().data
    if not rows: raise HTTPException(404, "Member not found")
    return rows[0]

@router.delete("/{group_id}/members/{member_id}", status_code=204)
def remove_member(group_id: str, member_id: str, user: dict = Depends(get_current_user)):
    _owner(group_id, user)
    if member_id == user["id"]: raise HTTPException(400, "Transfer ownership before removing yourself")
    rows = supabase.table("group_members").delete().eq("group_id", group_id).eq("user_id", member_id).select("user_id").execute().data
    if not rows: raise HTTPException(404, "Member not found")

@router.get("/{group_id}/articles")
def list_group_articles(group_id: str, user: dict = Depends(get_current_user)):
    _group(group_id, user)
    links = supabase.table("group_articles").select("article_id").eq("group_id", group_id).execute().data or []
    ids = [row["article_id"] for row in links]
    if not ids: return []
    return supabase.table("articles").select("*").in_("id", ids).order("created_at", desc=True).execute().data

@router.post("/{group_id}/articles", status_code=201)
def assign_article(group_id: str, payload: ArticleAssign, request: Request, user: dict = Depends(get_current_user)):
    group, member_role = _group(group_id, user)
    if member_role not in {"owner", "editor"}: raise HTTPException(403, "Only group owners and editors can assign articles")
    article = supabase.table("articles").select("id,author_id").eq("id", payload.article_id).limit(1).execute().data
    if not article: raise HTTPException(404, "Article not found")
    if user["role"] != "admin" and article[0]["author_id"] != user["id"]:
        raise HTTPException(403, "You can only assign an article you own")
    row = supabase.table("group_articles").upsert({"group_id": group_id, "article_id": payload.article_id, "assigned_by": user["id"]}, on_conflict="group_id,article_id").select("*").execute().data[0]
    audit(user["id"], "group.article.assign", request, "article", str(payload.article_id), {"group_id": group_id})
    return row

@router.delete("/{group_id}/articles/{article_id}", status_code=204)
def unassign_article(group_id: str, article_id: int, request: Request, user: dict = Depends(get_current_user)):
    _, member_role = _group(group_id, user)
    if member_role not in {"owner", "editor"}: raise HTTPException(403, "Only group owners and editors can unassign articles")
    rows = supabase.table("group_articles").delete().eq("group_id", group_id).eq("article_id", article_id).select("article_id").execute().data
    if not rows: raise HTTPException(404, "Group article not found")
    audit(user["id"], "group.article.unassign", request, "article", str(article_id), {"group_id": group_id})

@router.patch("/{group_id}/articles/{article_id}")
def update_group_article(group_id: str, article_id: int, payload: ArticleUpdate, request: Request, user: dict = Depends(get_current_user)):
    _, member_role = _group(group_id, user)
    if member_role not in {"owner", "editor"}: raise HTTPException(403, "Only group owners and editors can update shared articles")
    assignment = supabase.table("group_articles").select("article_id").eq("group_id", group_id).eq("article_id", article_id).limit(1).execute().data
    if not assignment: raise HTTPException(404, "Article is not assigned to this group")
    fields = payload.model_dump(exclude_unset=True)
    if not fields: raise HTTPException(400, "No fields provided for update")
    if "status" in fields and user["role"] != "admin": raise HTTPException(403, "Only administrators can change article status")
    if "category_id" in fields and fields["category_id"] is not None:
        category = supabase.table("categories").select("id").eq("id", fields["category_id"]).limit(1).execute().data
        if not category: raise HTTPException(404, "Category not found")
    fields["updated_at"] = datetime.now(timezone.utc).isoformat()
    rows = supabase.table("articles").update(fields).eq("id", article_id).select("*").execute().data
    if not rows: raise HTTPException(404, "Article not found")
    audit(user["id"], "group.article.update", request, "article", str(article_id), {"group_id": group_id})
    return rows[0]
