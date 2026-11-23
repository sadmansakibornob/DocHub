import logging
from fastapi import Request
from app.db import supabase
log = logging.getLogger(__name__)

def audit(actor_id: str | None, action: str, request: Request | None = None,
          target_type: str | None = None, target_id: str | None = None,
          metadata: dict | None = None) -> None:
    row = {
        "actor_id": actor_id, "action": action, "target_type": target_type,
        "target_id": target_id, "metadata": metadata or {},
        "ip_address": request.client.host if request and request.client else None,
        "user_agent": request.headers.get("user-agent", "")[:500] if request else None,
    }
    try:
        supabase.table("audit_logs").insert(row).execute()
    except Exception:
        # Do not leak database errors or secrets to clients.
        log.exception("Audit log insert failed")
