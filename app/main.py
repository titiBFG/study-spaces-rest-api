from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers.posts import router as posts_router
from app.routers.reports import router as reports_router
from app.routers.reviews import router as reviews_router
from app.routers.study_spaces import router as spaces_router
from app.routers.study_spaces_lists import favorites_router
from app.routers.study_spaces_lists import router as lists_router
from app.routers.users import router as users_router

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
    description="API RESTful para encontrar y valorar espacios aptos para estudiar.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(spaces_router)
app.include_router(users_router)
app.include_router(lists_router)
app.include_router(favorites_router)
app.include_router(reviews_router)
app.include_router(posts_router)
app.include_router(reports_router)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
