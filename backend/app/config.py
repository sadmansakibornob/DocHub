from functools import lru_cache
from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
    supabase_url: str = Field(validation_alias=AliasChoices("SUPABASE_URL", "VITE_PUBLIC_SUPABASE_URL"))
    supabase_anon_key: str = Field(validation_alias=AliasChoices("SUPABASE_ANON_KEY"))
    supabase_service_role_key: str = Field(validation_alias=AliasChoices("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"))
    password_pepper: str = Field(min_length=32)
    jwt_secret: str = Field(min_length=32)
    refresh_encryption_key: str = Field(min_length=40)
    frontend_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    access_token_minutes: int = 15
    refresh_token_days: int = 30
    cookie_secure: bool = False
    cookie_samesite: str = "lax"
    model_config = SettingsConfigDict(env_file=Path(__file__).resolve().parent.parent / ".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [x.strip() for x in self.frontend_origins.split(",") if x.strip()]

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
