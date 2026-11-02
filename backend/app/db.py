import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SUPABASE_URL = os.getenv("VITE_PUBLIC_SUPABASE_URL")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_SECRET_KEY or not SUPABASE_ANON_KEY:
    raise RuntimeError("Supabase credentials are missing")

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SECRET_KEY,
)