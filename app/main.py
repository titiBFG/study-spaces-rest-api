from fastapi import FastAPI

from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
    description="API RESTful para encontrar y valorar espacios aptos para estudiar.",
)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    """Return the API process health status."""

    return {"status": "ok"}
