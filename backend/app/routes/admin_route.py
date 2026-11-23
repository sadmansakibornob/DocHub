import csv, io
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from app.db import supabase
from app.rbac import require_role
from app.schemas.auth_schema import BanRequest, RoleUpdateRequest, BulkUsersRequest, ArticleModerationRequest
from app.audit import audit

router = APIRouter(prefix="/api/admin", tags=["Administration"])

def _user(uid: str) -> dict:
    rows = supabase.table("users").select("id,name,email,role,is_banned,ban_reason,created_at,updated_at").eq("id", uid).limit(1).execute().data
    if not rows: raise HTTPException(404, "User not found")
    return rows[0]

def _revoke(uid: str) -> int:
    rows = supabase.table("auth_sessions").update({"revoked_at": datetime.now(timezone.utc).isoformat()}).eq("user_id", uid).is_("revoked_at", "null").select("id").execute().data
    return len(rows or [])

@router.get("/dashboard")
def dashboard(_: dict = Depends(require_role("admin"))):
    since = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    users_q = supabase.table("users").select("id", count="exact")
    users_total = users_q.execute().count or 0
    banned_total = supabase.table("users").select("id", count="exact").eq("is_banned", True).execute().count or 0
    articles_total = supabase.table("articles").select("id", count="exact").execute().count or 0
    groups_total = supabase.table("groups").select("id", count="exact").execute().count or 0
    new_users = supabase.table("users").select("id", count="exact").gte("created_at", since).execute().count or 0
    new_articles = supabase.table("articles").select("id", count="exact").gte("created_at", since).execute().count or 0
    new_groups = supabase.table("groups").select("id", count="exact").gte("created_at", since).execute().count or 0
    return {"users_total": users_total, "banned_users": banned_total,
            "records_total": articles_total, "groups_total": groups_total,
            "new_users_7d": new_users, "new_records_7d": new_articles,
            "new_groups_7d": new_groups}

@router.get("/users")
def list_users(search: str | None = None, role: str | None = None, status: str | None = None,
               limit: int = Query(25, ge=1, le=100), offset: int = Query(0, ge=0),
               _: dict = Depends(require_role("admin"))):
    q = supabase.table("users").select("id,name,email,role,is_banned,ban_reason,created_at,updated_at", count="exact")
    if role:
        if role not in {"user", "admin"}: raise HTTPException(422, "Invalid role filter")
        q = q.eq("role", role)
    if status:
        if status not in {"active", "banned"}: raise HTTPException(422, "Invalid status filter")
        q = q.eq("is_banned", status == "banned")
    if search:
        import re
        term = re.sub(r"[^A-Za-z0-9@._+\- ]", "", search.strip()[:80])
        if term: q = q.or_(f"name.ilike.%{term}%,email.ilike.%{term}%")
    result = q.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return {"items": result.data or [], "total": result.count or 0, "limit": limit, "offset": offset}

@router.get("/users/{user_id}")
def user_detail(user_id: str, _: dict = Depends(require_role("admin"))):
    user = _user(user_id)
    user["records"] = supabase.table("articles").select("id,title,status,created_at").eq("author_id", user_id).order("created_at", desc=True).limit(50).execute().data or []
    memberships = supabase.table("group_members").select("group_id,role,groups(id,name)").eq("user_id", user_id).execute().data or []
    user["groups"] = memberships
    user["sessions"] = supabase.table("auth_sessions").select("id,user_agent,ip_address,created_at,last_seen_at,expires_at,revoked_at").eq("user_id", user_id).order("created_at", desc=True).limit(50).execute().data or []
    user["recent_activity"] = supabase.table("audit_logs").select("action,target_type,target_id,metadata,created_at,ip_address,user_agent").eq("actor_id", user_id).order("created_at", desc=True).limit(50).execute().data or []
    return user

@router.patch("/users/{user_id}/role")
def update_role(user_id: str, payload: RoleUpdateRequest, request: Request, actor: dict = Depends(require_role("admin"))):
    target = _user(user_id)
    if user_id == actor["id"]: raise HTTPException(400, "You cannot change your own role")
    if target["role"] == "admin" and payload.role != "admin":
        admins = supabase.table("users").select("id").eq("role", "admin").execute().data or []
        if len(admins) <= 1: raise HTTPException(409, "Cannot demote the last administrator")
    row = supabase.table("users").update({"role": payload.role, "updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", user_id).select("id,name,email,role,is_banned").execute().data[0]
    _revoke(user_id)
    audit(actor["id"], "admin.user.role_change", request, "user", user_id, {"old_role": target["role"], "new_role": payload.role})
    return row

@router.post("/users/{user_id}/ban")
def ban_user(user_id: str, payload: BanRequest, request: Request, actor: dict = Depends(require_role("admin"))):
    target = _user(user_id)
    if user_id == actor["id"]: raise HTTPException(400, "You cannot ban your own account")
    if target["role"] == "admin": raise HTTPException(403, "Administrators cannot ban another administrator")
    row = supabase.table("users").update({"is_banned": True, "ban_reason": payload.reason.strip(), "updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", user_id).select("id,name,email,role,is_banned,ban_reason").execute().data[0]
    revoked = _revoke(user_id)
    audit(actor["id"], "admin.user.ban", request, "user", user_id, {"reason": payload.reason.strip(), "sessions_revoked": revoked})
    return row

@router.post("/users/{user_id}/unban")
def unban_user(user_id: str, request: Request, actor: dict = Depends(require_role("admin"))):
    _user(user_id)
    row = supabase.table("users").update({"is_banned": False, "ban_reason": None, "updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", user_id).select("id,name,email,role,is_banned").execute().data[0]
    audit(actor["id"], "admin.user.unban", request, "user", user_id)
    return row

@router.post("/users/bulk-ban")
def bulk_ban(payload: BulkUsersRequest, request: Request, actor: dict = Depends(require_role("admin"))):
    ids = list(dict.fromkeys(payload.user_ids))
    if actor["id"] in ids: raise HTTPException(400, "Bulk action cannot include your own account")
    targets = supabase.table("users").select("id,role").in_("id", ids).execute().data or []
    if len(targets) != len(ids): raise HTTPException(404, "One or more users were not found")
    if any(x["role"] == "admin" for x in targets): raise HTTPException(403, "Administrators cannot be bulk-banned")
    now = datetime.now(timezone.utc).isoformat()
    supabase.table("users").update({"is_banned": True, "ban_reason": payload.reason.strip(), "updated_at": now}).in_("id", ids).execute()
    revoked = 0
    for uid in ids: revoked += _revoke(uid)
    audit(actor["id"], "admin.user.bulk_ban", request, "users", metadata={"user_ids": ids, "reason": payload.reason.strip()})
    return {"updated": len(ids), "sessions_revoked": revoked}

@router.post("/users/bulk-unban")
def bulk_unban(payload: list[str], request: Request, actor: dict = Depends(require_role("admin"))):
    ids = list(dict.fromkeys(payload))
    if not ids or len(ids) > 100: raise HTTPException(422, "Provide between 1 and 100 user IDs")
    found = supabase.table("users").select("id").in_("id", ids).execute().data or []
    if len(found) != len(ids): raise HTTPException(404, "One or more users were not found")
    result = supabase.table("users").update({"is_banned": False, "ban_reason": None, "updated_at": datetime.now(timezone.utc).isoformat()}).in_("id", ids).select("id").execute()
    audit(actor["id"], "admin.user.bulk_unban", request, "users", metadata={"user_ids": ids})
    return {"updated": len(result.data or [])}

@router.post("/users/{user_id}/revoke-sessions")
def revoke_user_sessions(user_id: str, request: Request, actor: dict = Depends(require_role("admin"))):
    _user(user_id); count = _revoke(user_id)
    audit(actor["id"], "admin.user.sessions_revoke", request, "user", user_id, {"count": count})
    return {"revoked": count}

@router.get("/moderation/articles")
def moderation_articles(status: str | None = None, limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0), _: dict = Depends(require_role("admin"))):
    q = supabase.table("articles").select("*", count="exact")
    if status:
        if status not in {"draft", "review", "published"}: raise HTTPException(422, "Invalid article status")
        q = q.eq("status", status)
    r = q.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return {"items": r.data or [], "total": r.count or 0, "limit": limit, "offset": offset}

@router.delete("/moderation/articles/{article_id}", status_code=204)
def delete_article(article_id: int, request: Request, actor: dict = Depends(require_role("admin"))):
    rows = supabase.table("articles").delete().eq("id", article_id).select("id").execute().data
    if not rows: raise HTTPException(404, "Article not found")
    audit(actor["id"], "admin.article.delete", request, "article", str(article_id))

@router.post("/moderation/articles/bulk-delete")
def bulk_delete_articles(payload: ArticleModerationRequest, request: Request, actor: dict = Depends(require_role("admin"))):
    ids = list(dict.fromkeys(payload.article_ids))
    rows = supabase.table("articles").delete().in_("id", ids).select("id").execute().data or []
    audit(actor["id"], "admin.article.bulk_delete", request, "articles", metadata={"ids": ids})
    return {"deleted": len(rows)}

@router.get("/moderation/groups")
def moderation_groups(limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0), _: dict = Depends(require_role("admin"))):
    r = supabase.table("groups").select("*", count="exact").order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return {"items": r.data or [], "total": r.count or 0, "limit": limit, "offset": offset}

@router.delete("/moderation/groups/{group_id}", status_code=204)
def delete_group(group_id: str, request: Request, actor: dict = Depends(require_role("admin"))):
    rows = supabase.table("groups").delete().eq("id", group_id).select("id").execute().data
    if not rows: raise HTTPException(404, "Group not found")
    audit(actor["id"], "admin.group.delete", request, "group", group_id)

@router.get("/audit-logs")
def audit_logs(action: str | None = None, search: str | None = None, limit: int = Query(50, ge=1, le=200), offset: int = Query(0, ge=0), _: dict = Depends(require_role("admin"))):
    q = supabase.table("audit_logs").select("*", count="exact")
    if action: q = q.eq("action", action[:100])
    if search: q = q.ilike("action", f"%{search.strip()[:80]}%")
    r = q.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return {"items": r.data or [], "total": r.count or 0, "limit": limit, "offset": offset}

@router.get("/security/failed-logins")
def failed_logins(limit: int = Query(100, ge=1, le=500), _: dict = Depends(require_role("admin"))):
    rows = supabase.table("login_attempts").select("email,ip_address,attempted_at,user_agent").eq("succeeded", False).order("attempted_at", desc=True).limit(limit).execute().data or []
    summary = {}
    for row in rows:
        for key, value in (("ip", row.get("ip_address") or "unknown"), ("account", row.get("email") or "unknown")):
            summary.setdefault(key, {}).setdefault(value, 0); summary[key][value] += 1
    return {"events": rows, "by_ip": summary.get("ip", {}), "by_account": summary.get("account", {})}

def _csv(rows: list[dict], fields: list[str], filename: str):
    out = io.StringIO(); writer = csv.DictWriter(out, fieldnames=fields, extrasaction="ignore"); writer.writeheader(); writer.writerows(rows)
    return StreamingResponse(iter([out.getvalue()]), media_type="text/csv", headers={"Content-Disposition": f"attachment; filename={filename}"})

@router.get("/export/users.csv")
def export_users(request: Request, role: str | None = None, status: str | None = None, actor: dict = Depends(require_role("admin"))):
    q = supabase.table("users").select("id,name,email,role,is_banned,created_at")
    if role in {"user", "admin"}: q = q.eq("role", role)
    if status in {"active", "banned"}: q = q.eq("is_banned", status == "banned")
    rows = q.order("created_at", desc=True).execute().data or []
    audit(actor["id"], "admin.export.users", request, "export", metadata={"role": role, "status": status})
    return _csv(rows, ["id", "name", "email", "role", "is_banned", "created_at"], "dochub-users.csv")

@router.get("/export/articles.csv")
def export_articles(request: Request, status: str | None = None, actor: dict = Depends(require_role("admin"))):
    q = supabase.table("articles").select("id,title,author_id,category_id,status,created_at,updated_at")
    if status in {"draft", "review", "published"}: q = q.eq("status", status)
    rows = q.order("created_at", desc=True).execute().data or []
    audit(actor["id"], "admin.export.articles", request, "export", metadata={"status": status})
    return _csv(rows, ["id", "title", "author_id", "category_id", "status", "created_at", "updated_at"], "dochub-articles.csv")

@router.get("/export/activity.csv")
def export_activity(request: Request, action: str | None = None, actor: dict = Depends(require_role("admin"))):
    q = supabase.table("audit_logs").select("actor_id,action,target_type,target_id,metadata,ip_address,user_agent,created_at")
    if action: q = q.eq("action", action[:100])
    rows = q.order("created_at", desc=True).limit(10000).execute().data or []
    audit(actor["id"], "admin.export.activity", request, "export", metadata={"action": action})
    return _csv(rows, ["actor_id", "action", "target_type", "target_id", "metadata", "ip_address", "user_agent", "created_at"], "dochub-activity.csv")

@router.post("/moderation/groups/bulk-delete")
def bulk_delete_groups(payload: list[str], request: Request, actor: dict = Depends(require_role("admin"))):
    ids = list(dict.fromkeys(payload))
    if not ids or len(ids) > 100: raise HTTPException(422, "Provide between 1 and 100 group IDs")
    rows = supabase.table("groups").delete().in_("id", ids).select("id").execute().data or []
    audit(actor["id"], "admin.group.bulk_delete", request, "groups", metadata={"ids": ids})
    return {"deleted": len(rows)}
