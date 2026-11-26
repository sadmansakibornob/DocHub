import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, field_validator

from app.audit import audit
from app.repositories import group_repository as group_repo
from app.schemas.article_schema import ArticleUpdate
from app.security import get_current_user

router = APIRouter(prefix="/api/groups", tags=["Groups"])


# --------------------------------------------------
# SCHEMAS
# --------------------------------------------------


class GroupCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=1000)


class GroupUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=1000)


class ArticleAssign(BaseModel):
    article_id: int


class MemberAdd(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    role: str = Field(default="member", pattern=r"^(member|editor)$")

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        value = value.strip().lower()

        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value):
            raise ValueError("Enter a valid email address")

        return value


class MemberRoleUpdate(BaseModel):
    role: str = Field(pattern=r"^(member|editor)$")


# --------------------------------------------------
# HELPERS
# --------------------------------------------------


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _group(group_id: str, user: dict) -> tuple[dict, str]:
    """
    Retrieve a group and verify membership.

    Restore owner membership if it is missing.
    """

    group = group_repo.get_group_by_id(group_id)

    if not group:
        raise HTTPException(
            status_code=404,
            detail="Group not found",
        )

    membership = group_repo.get_group_membership(
        group_id,
        user["id"],
    )

    # Restore missing owner membership.
    if not membership and group["owner_id"] == user["id"]:
        membership = group_repo.add_or_restore_membership(
            group_id,
            user["id"],
            "owner",
        )

        # Verify again if upsert returned no row.
        if not membership:
            membership = group_repo.get_group_membership(
                group_id,
                user["id"],
            )

    if not membership:
        raise HTTPException(
            status_code=404,
            detail="Only group members can view this group",
        )

    return group, membership["role"]


def _owner(group_id: str, user: dict) -> dict:
    group, role = _group(group_id, user)

    if group["owner_id"] != user["id"] or role != "owner":
        raise HTTPException(
            status_code=403,
            detail="Only the group owner can manage this group",
        )

    return group


def _require_editor(group_id: str, user: dict) -> tuple[dict, str]:
    group, role = _group(group_id, user)

    if role not in {"owner", "editor"}:
        raise HTTPException(
            status_code=403,
            detail="Only group owners and editors can perform this action",
        )

    return group, role


# --------------------------------------------------
# CREATE GROUP
# --------------------------------------------------


@router.post("", status_code=201)
def create_group(
    payload: GroupCreate,
    request: Request,
    user: dict = Depends(get_current_user),
):
    group = group_repo.create_group(
        {
            "name": payload.name.strip(),
            "description": payload.description,
            "owner_id": user["id"],
        }
    )

    if not group:
        raise HTTPException(
            status_code=500,
            detail="Could not create group",
        )

    try:
        membership = group_repo.add_or_restore_membership(
            group["id"],
            user["id"],
            "owner",
        )

        if not membership:
            raise RuntimeError("Owner membership was not created")

    except Exception as exc:
        group_repo.delete_group(group["id"])

        raise HTTPException(
            status_code=500,
            detail="Group was created but owner membership failed",
        ) from exc

    audit(
        user["id"],
        "group.create",
        request,
        "group",
        str(group["id"]),
        {"name": group["name"]},
    )

    return {
        **group,
        "membership_role": "owner",
    }


# --------------------------------------------------
# LIST GROUPS
# --------------------------------------------------


@router.get("")
def list_groups(
    user: dict = Depends(get_current_user),
):
    memberships = group_repo.get_user_memberships(user["id"])

    group_ids = {row["group_id"] for row in memberships}

    owned_groups = group_repo.get_owned_groups(user["id"])

    for group in owned_groups:
        group_id = group["id"]

        if group_id not in group_ids:
            group_repo.add_or_restore_membership(
                group_id,
                user["id"],
                "owner",
            )

            group_ids.add(group_id)

    if not group_ids:
        return []

    groups = group_repo.get_groups_by_ids(list(group_ids))

    membership_roles = {item["group_id"]: item["role"] for item in memberships}

    return [
        {
            **group,
            "membership_role": (
                "owner"
                if group["owner_id"] == user["id"]
                else membership_roles.get(group["id"], "member")
            ),
        }
        for group in groups
    ]


# --------------------------------------------------
# GET GROUP DETAILS
# --------------------------------------------------


@router.get("/{group_id}")
def get_group(
    group_id: str,
    user: dict = Depends(get_current_user),
):
    group, role = _group(group_id, user)

    return {
        **group,
        "membership_role": role,
    }


# --------------------------------------------------
# UPDATE GROUP
# --------------------------------------------------


@router.patch("/{group_id}")
def rename_group(
    group_id: str,
    payload: GroupUpdate,
    request: Request,
    user: dict = Depends(get_current_user),
):
    _owner(group_id, user)

    fields = payload.model_dump(exclude_unset=True)

    if not fields:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update",
        )

    if "name" in fields and fields["name"] is not None:
        fields["name"] = fields["name"].strip()

        if len(fields["name"]) < 2:
            raise HTTPException(
                status_code=422,
                detail="Group name must contain at least 2 characters",
            )

    fields["updated_at"] = _now()

    updated = group_repo.update_group(
        group_id,
        fields,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Group not found",
        )

    audit(
        user["id"],
        "group.update",
        request,
        "group",
        group_id,
        fields,
    )

    return updated


# --------------------------------------------------
# DELETE GROUP
# --------------------------------------------------


@router.delete("/{group_id}", status_code=204)
def delete_group(
    group_id: str,
    request: Request,
    user: dict = Depends(get_current_user),
):
    _owner(group_id, user)

    audit(
        user["id"],
        "group.delete",
        request,
        "group",
        group_id,
        {},
    )

    group_repo.delete_group(group_id)


# --------------------------------------------------
# LIST MEMBERS
# --------------------------------------------------


@router.get("/{group_id}/members")
def list_members(
    group_id: str,
    user: dict = Depends(get_current_user),
):
    _group(group_id, user)

    return group_repo.list_group_members(group_id)


# --------------------------------------------------
# ADD MEMBER
# --------------------------------------------------


@router.post("/{group_id}/members", status_code=201)
def add_member(
    group_id: str,
    payload: MemberAdd,
    request: Request,
    user: dict = Depends(get_current_user),
):
    _owner(group_id, user)

    target = group_repo.find_user_by_email(payload.email)

    if not target:
        raise HTTPException(
            status_code=404,
            detail="No registered user found with this email address",
        )

    target_user_id = target["id"]

    if target_user_id == user["id"]:
        raise HTTPException(
            status_code=400,
            detail="You are already the group owner",
        )

    existing = group_repo.get_member(
        group_id,
        target_user_id,
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="This user is already a member of the group",
        )

    row = group_repo.create_membership(
        group_id,
        target_user_id,
        payload.role,
    )

    if not row:
        raise HTTPException(
            status_code=500,
            detail="Could not add group member",
        )

    audit(
        user["id"],
        "group.member.add",
        request,
        "group",
        group_id,
        {
            "member_id": target_user_id,
            "member_email": payload.email,
            "role": payload.role,
        },
    )

    return row


# --------------------------------------------------
# UPDATE MEMBER ROLE
# --------------------------------------------------


@router.patch("/{group_id}/members/{member_id}")
def update_member_role(
    group_id: str,
    member_id: str,
    payload: MemberRoleUpdate,
    request: Request,
    user: dict = Depends(get_current_user),
):
    _owner(group_id, user)

    if member_id == user["id"]:
        raise HTTPException(
            status_code=400,
            detail="Owner role cannot be changed",
        )

    existing = group_repo.get_member(
        group_id,
        member_id,
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )

    if existing["role"] == "owner":
        raise HTTPException(
            status_code=400,
            detail="Group owner role cannot be changed",
        )

    updated = group_repo.update_member_role(
        group_id,
        member_id,
        payload.role,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )

    audit(
        user["id"],
        "group.member.role.update",
        request,
        "group",
        group_id,
        {
            "member_id": member_id,
            "role": payload.role,
        },
    )

    return updated


# --------------------------------------------------
# REMOVE MEMBER
# --------------------------------------------------


@router.delete(
    "/{group_id}/members/{member_id}",
    status_code=204,
)
def remove_member(
    group_id: str,
    member_id: str,
    request: Request,
    user: dict = Depends(get_current_user),
):
    _owner(group_id, user)

    if member_id == user["id"]:
        raise HTTPException(
            status_code=400,
            detail="Transfer ownership before removing yourself",
        )

    existing = group_repo.get_member(
        group_id,
        member_id,
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )

    if existing["role"] == "owner":
        raise HTTPException(
            status_code=400,
            detail="The group owner cannot be removed",
        )

    group_repo.delete_member(
        group_id,
        member_id,
    )

    audit(
        user["id"],
        "group.member.remove",
        request,
        "group",
        group_id,
        {"member_id": member_id},
    )


# --------------------------------------------------
# LIST SHARED ARTICLES
# --------------------------------------------------


@router.get("/{group_id}/articles")
def list_group_articles(
    group_id: str,
    user: dict = Depends(get_current_user),
):
    _group(group_id, user)

    links = group_repo.get_group_article_links(group_id)

    article_ids = [row["article_id"] for row in links]

    if not article_ids:
        return []

    return group_repo.get_articles_by_ids(article_ids)


# --------------------------------------------------
# ASSIGN ARTICLE
# --------------------------------------------------


@router.post("/{group_id}/articles", status_code=201)
def assign_article(
    group_id: str,
    payload: ArticleAssign,
    request: Request,
    user: dict = Depends(get_current_user),
):
    _require_editor(group_id, user)

    article = group_repo.get_article_for_assignment(
        payload.article_id,
    )

    if not article:
        raise HTTPException(
            status_code=404,
            detail="Article not found",
        )

    if user["role"] != "admin" and article["author_id"] != user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You can only assign an article you own",
        )

    row = group_repo.assign_article(
        group_id,
        payload.article_id,
        user["id"],
    )

    if not row:
        raise HTTPException(
            status_code=500,
            detail="Could not assign article",
        )

    audit(
        user["id"],
        "group.article.assign",
        request,
        "article",
        str(payload.article_id),
        {"group_id": group_id},
    )

    return row


# --------------------------------------------------
# UNASSIGN ARTICLE
# --------------------------------------------------


@router.delete(
    "/{group_id}/articles/{article_id}",
    status_code=204,
)
def unassign_article(
    group_id: str,
    article_id: int,
    request: Request,
    user: dict = Depends(get_current_user),
):
    _require_editor(group_id, user)

    rows = group_repo.remove_group_article(
        group_id,
        article_id,
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Group article not found",
        )

    audit(
        user["id"],
        "group.article.unassign",
        request,
        "article",
        str(article_id),
        {"group_id": group_id},
    )


# --------------------------------------------------
# UPDATE SHARED ARTICLE
# --------------------------------------------------


@router.patch("/{group_id}/articles/{article_id}")
def update_group_article(
    group_id: str,
    article_id: int,
    payload: ArticleUpdate,
    request: Request,
    user: dict = Depends(get_current_user),
):
    _require_editor(group_id, user)

    assignment = group_repo.get_group_article_assignment(
        group_id,
        article_id,
    )

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Article is not assigned to this group",
        )

    fields = payload.model_dump(exclude_unset=True)

    if not fields:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update",
        )

    if "status" in fields and user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only administrators can change article status",
        )

    if "category_id" in fields and fields["category_id"] is not None:
        if not group_repo.category_exists(fields["category_id"]):
            raise HTTPException(
                status_code=404,
                detail="Category not found",
            )

    fields["updated_at"] = _now()

    updated = group_repo.update_article(
        article_id,
        fields,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Article not found",
        )

    audit(
        user["id"],
        "group.article.update",
        request,
        "article",
        str(article_id),
        {"group_id": group_id},
    )

    return updated
