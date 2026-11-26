from supabase import Client, create_client

from app.config import settings

# Service-role client is backend-only. Never expose this key to Vite/browser code.
supabase: Client = create_client(
    settings.supabase_url, settings.supabase_service_role_key
)


def new_auth_client() -> Client:
    # A fresh anon client per authentication operation avoids cross-user session state.
    return create_client(settings.supabase_url, settings.supabase_anon_key)
