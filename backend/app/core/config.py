from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "CreatorForge AI Backend"
    app_env: str = "development"
    api_prefix: str = "/api"

    database_url: str = "postgresql+asyncpg://creatorforge:creatorforge@db:5432/creatorforge"

    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    groq_base_url: str = "https://api.groq.com/openai/v1/chat/completions"

    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.allowed_origins.split(",")
            if origin.strip()
        ]

    @property
    def async_database_url(self) -> str:
        url = self.database_url

        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

        url = url.replace("sslmode=require", "ssl=require")

        return url


@lru_cache
def get_settings() -> Settings:
    return Settings()
