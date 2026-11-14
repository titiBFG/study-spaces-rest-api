
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.models.user import User
from app.schemas.user import LoginResponse, UserCreate, UserLogin, UserResponse
from app.services.auth_service import create_token, get_current_user
from app.services.user_service import login_user, register_user

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(
    data: UserCreate,
    session: Session = Depends(get_session),
):
    return register_user(session, data)


@router.post("/login", response_model=LoginResponse)
def login(
    data: UserLogin,
    session: Session = Depends(get_session),  # noqa: B008
):
    user = login_user(session, data)

    return {
        "access_token": create_token(user),
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=UserResponse)
def my_account(user: User = Depends(get_current_user)):  # noqa: B008
    return user
