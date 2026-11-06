
from fastapi import FastAPI

from app.core.config import get_settings
from app.routers.study_spaces import router as spaces_router

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
    description="API RESTful para encontrar y valorar espacios aptos para estudiar.",
)

app.include_router(spaces_router)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    """Return the API process health status."""
    return {"status": "ok"}
