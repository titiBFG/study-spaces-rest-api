
import bcrypt
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import BusinessUser, StudentUser, User
from app.repositories.user_repository import create_user, get_user_by_email
from app.schemas.user import UserCreate, UserLogin


def register_user(
    session: Session, data: UserCreate, user_class: type[User] = StudentUser
):
    """Registra un usuario del tipo indicado (por defecto, estudiante)."""
    email = data.email.lower()

    if get_user_by_email(session, email):
        raise HTTPException(
            status_code=400,
            detail="El correo ya está registrado",
        )

    password_bytes = data.password.encode("utf-8")

    if len(password_bytes) > 72:
        raise HTTPException(
            status_code=400,
            detail="La contraseña es demasiado larga",
        )

    hashed_password = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt(),
    ).decode("utf-8")

    return create_user(
        session,
        user_class,
        data.full_name,
        email,
        hashed_password,
    )


def register_student(session: Session, data: UserCreate):
    """Registra un usuario con rol de estudiante."""
    return register_user(session, data, StudentUser)


def register_business(session: Session, data: UserCreate):
    """Registra un usuario con rol de negocio."""
    return register_user(session, data, BusinessUser)


def login_user(session: Session, data: UserLogin):
    """Valida credenciales y estado activo del usuario para iniciar sesión."""
    user = get_user_by_email(session, data.email.lower())

    if user is None or not user.verify_password(data.password):
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="La cuenta está desactivada",
        )

    return user
