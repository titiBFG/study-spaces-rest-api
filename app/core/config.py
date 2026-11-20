
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración de la aplicación cargada desde variables de entorno y `.env`."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Study Spaces API"
    app_version: str = "0.1.0"
    debug: bool = False
    database_url: str = "sqlite:///./study_spaces.db"
    secret_key: str


@lru_cache
def get_settings() -> Settings:
    """Devuelve una instancia cacheada de la configuración de la aplicación."""
    return Settings()
