import csv
import io

from fastapi import (
    APIRouter,
    Body,
    Depends,
    HTTPException,
    Query,
)
from fastapi.responses import StreamingResponse

from app.audit import audit as write_audit
from app.rbac import require_role
from app.repositories import admin_repository as repo

router = APIRouter(
    prefix="/api/admin",
    tags=["Administration"],
)


# ==================================================
# HELPERS
# ==================================================


def audit(
    admin,
    action,
    target_type=None,
    target_id=None,
    metadata=None,
):
    write_audit(
        actor_id=admin["id"],
        action=action,
        target_type=target_type,
        target_id=str(target_id) if target_id is not None else None,
        metadata=metadata,
    )


def get_existing_user(user_id):
    user = repo.get_user(user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user


def create_csv(rows, fields, filename):
    output = io.StringIO()

    writer = csv.DictWriter(
        output,
        fieldnames=fields,
        extrasaction="ignore",
    )

    writer.writeheader()
    writer.writerows(rows)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ==================================================
# DASHBOARD
# ==================================================


@router.get("/dashboard")
def get_dashboard(
    admin: dict = Depends(require_role("admin")),
):
    return repo.get_dashboard_stats()


# ==================================================
# USER MANAGEMENT
# ==================================================


@router.get("/users")
def list_users(
    search: str | None = None,
    role: str | None = None,
    status: str | None = None,
    limit: int = Query(25, ge=1, le=100),
    offset: int = Query(0, ge=0),
    admin: dict = Depends(require_role("admin")),
):
    if role and role not in {"user", "admin"}:
        raise HTTPException(400, "Invalid user role")

    if status and status not in {"active", "banned"}:
        raise HTTPException(400, "Invalid user status")

    return repo.list_users(
        search=search,
        role=role,
        status=status,
        limit=limit,
        offset=offset,
    )


@router.get("/users/{user_id}")
def get_user(
    user_id: str,
    admin: dict = Depends(require_role("admin")),
):
    return get_existing_user(user_id)


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    payload: dict = Body(...),
    admin: dict = Depends(require_role("admin")),
):
    get_existing_user(user_id)

    role = payload.get("role")

    if role not in {"user", "admin"}:
        raise HTTPException(400, "Invalid user role")

    if user_id == admin["id"] and role != "admin":
        raise HTTPException(
            400,
            "You cannot remove your own admin role",
        )

    repo.update_user_role(user_id, role)

    audit(
        admin,
        "user_role_updated",
        "user",
        user_id,
        {"role": role},
    )

    return {
        "message": "User role updated successfully",
        "user": repo.get_user(user_id),
    }


# Supports both POST and PATCH because the frontend currently sends POST.
@router.api_route(
    "/users/{user_id}/ban",
    methods=["POST", "PATCH"],
)
def update_user_ban(
    user_id: str,
    payload: dict = Body(...),
    admin: dict = Depends(require_role("admin")),
):
    get_existing_user(user_id)

    banned = payload.get("is_banned")

    if not isinstance(banned, bool):
        raise HTTPException(
            400,
            "is_banned must be true or false",
        )

    if user_id == admin["id"] and banned:
        raise HTTPException(
            400,
            "You cannot ban your own account",
        )

    reason = payload.get("reason")

    repo.set_user_banned(
        user_id,
        banned,
        reason,
    )

    revoked_sessions = 0

    if banned:
        revoked_sessions = repo.revoke_user_sessions(user_id)

    audit(
        admin,
        "user_banned" if banned else "user_unbanned",
        "user",
        user_id,
        {
            "reason": reason,
            "revoked_sessions": revoked_sessions,
        },
    )

    return {
        "message": (
            "User banned successfully" if banned else "User unbanned successfully"
        ),
        "user": repo.get_user(user_id),
        "revoked_sessions": revoked_sessions,
    }


@router.post("/users/{user_id}/revoke-sessions")
def revoke_user_sessions(
    user_id: str,
    admin: dict = Depends(require_role("admin")),
):
    get_existing_user(user_id)

    revoked = repo.revoke_user_sessions(user_id)

    audit(
        admin,
        "user_sessions_revoked",
        "user",
        user_id,
        {"revoked_sessions": revoked},
    )

    return {
        "message": "User sessions revoked successfully",
        "revoked_sessions": revoked,
    }


# ==================================================
# ARTICLE MODERATION
# ==================================================


@router.get("/articles")
def list_articles(
    status: str | None = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    admin: dict = Depends(require_role("admin")),
):
    return repo.get_articles(
        status=status,
        limit=limit,
        offset=offset,
    )


@router.get("/moderation/articles")
def get_moderation_articles(
    status: str | None = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    admin: dict = Depends(require_role("admin")),
):
    return repo.get_articles(
        status=status,
        limit=limit,
        offset=offset,
    )


@router.get("/articles/{article_id}")
def get_article(
    article_id: int,
    admin: dict = Depends(require_role("admin")),
):
    article = repo.get_article(article_id)

    if not article:
        raise HTTPException(
            404,
            "Article not found",
        )

    return article


@router.patch("/articles/{article_id}/status")
@router.patch("/moderation/articles/{article_id}/status")
def update_article_status(
    article_id: int,
    payload: dict = Body(...),
    admin: dict = Depends(require_role("admin")),
):
    article = repo.get_article(article_id)

    if not article:
        raise HTTPException(
            404,
            "Article not found",
        )

    status = payload.get("status")

    allowed_statuses = {
        "draft",
        "review",
        "published",
    }

    if status not in allowed_statuses:
        raise HTTPException(
            400,
            "Invalid article status",
        )

    repo.update_article_status(
        article_id,
        status,
    )

    audit(
        admin,
        "article_status_updated",
        "article",
        article_id,
        {"status": status},
    )

    return {
        "message": "Article status updated successfully",
        "article": repo.get_article(article_id),
    }


@router.delete("/articles/{article_id}")
def delete_article(
    article_id: int,
    admin: dict = Depends(require_role("admin")),
):
    article = repo.get_article(article_id)

    if not article:
        raise HTTPException(
            404,
            "Article not found",
        )

    repo.delete_article(article_id)

    audit(
        admin,
        "article_deleted",
        "article",
        article_id,
    )

    return {
        "message": "Article deleted successfully",
    }


# ==================================================
# GROUP MANAGEMENT
# ==================================================


@router.get("/groups")
def list_groups(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    admin: dict = Depends(require_role("admin")),
):
    return repo.get_groups(
        limit=limit,
        offset=offset,
    )


@router.get("/moderation/groups")
def get_moderation_groups(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    admin: dict = Depends(require_role("admin")),
):
    return repo.get_groups(
        limit=limit,
        offset=offset,
    )


@router.delete("/groups/{group_id}")
def delete_group(
    group_id: str,
    admin: dict = Depends(require_role("admin")),
):
    repo.delete_group(group_id)

    audit(
        admin,
        "group_deleted",
        "group",
        group_id,
    )

    return {
        "message": "Group deleted successfully",
    }


# ==================================================
# AUDIT LOGS
# ==================================================


@router.get("/audit-logs")
def list_audit_logs(
    action: str | None = None,
    search: str | None = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    admin: dict = Depends(require_role("admin")),
):
    return repo.get_audit_logs(
        action=action,
        search=search,
        limit=limit,
        offset=offset,
    )


# ==================================================
# SECURITY MONITORING
# ==================================================


@router.get("/security/failed-logins")
def get_failed_logins(
    limit: int = Query(100, ge=1, le=500),
    admin: dict = Depends(require_role("admin")),
):
    return repo.get_failed_logins(
        limit=limit,
    )


# ==================================================
# DATA EXPORT
# ==================================================


@router.get("/export/{table}")
def export_data(
    table: str,
    status: str | None = Query(None),
    admin: dict = Depends(require_role("admin")),
):
    table = table.removesuffix(".csv")

    # Frontend names mapped to actual database tables.
    allowed_tables = {
        "users": (
            "users",
            "id,name,email,role,is_banned,created_at",
        ),
        "articles": (
            "articles",
            "*",
        ),
        "groups": (
            "groups",
            "*",
        ),
        "activity": (
            "audit_logs",
            "*",
        ),
        "audit_logs": (
            "audit_logs",
            "*",
        ),
    }

    if table not in allowed_tables:
        raise HTTPException(
            400,
            "Export is not allowed for this table",
        )

    db_table, fields = allowed_tables[table]

    filters = {}

    if db_table == "articles" and status:
        if status not in {"draft", "review", "published"}:
            raise HTTPException(
                400,
                "Invalid article status",
            )

        filters["status"] = status

    rows = repo.get_export_rows(
        table=db_table,
        fields=fields,
        filters=filters,
    )

    if rows:
        csv_fields = list(rows[0].keys())
    elif fields != "*":
        csv_fields = fields.split(",")
    else:
        csv_fields = ["id"]

    audit(
        admin,
        "data_exported",
        db_table,
        metadata={
            "row_count": len(rows),
            "status": status or "all",
        },
    )

    return create_csv(
        rows,
        csv_fields,
        f"{table}.csv",
    )
