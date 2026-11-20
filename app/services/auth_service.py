
from datetime import UTC, datetime, timedelta

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.database.session import get_session
from app.models.user import AdminUser, BusinessUser, StudentUser, User

security = HTTPBearer()
settings = get_settings()


def create_token(user: User):
    """Genera un token JWT HS256 con el id del usuario y expiración de 8 horas."""
    expiration = datetime.now(UTC) + timedelta(hours=8)

    return jwt.encode(
        {"sub": str(user.id), "exp": expiration},
        settings.secret_key,
        algorithm="HS256",
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),  # noqa: B008
    session: Session = Depends(get_session),  # noqa: B008
):
    """Decodifica el token Bearer y devuelve el usuario activo correspondiente."""
    try:
        data = jwt.decode(
            credentials.credentials,
            settings.secret_key,
            algorithms=["HS256"],
        )
        user_id = int(data["sub"])
    except (jwt.InvalidTokenError, ValueError, KeyError):
        raise HTTPException(
            status_code=401,
            detail="Sesión inválida o vencida",
        )

    user = session.get(User, user_id)

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=401,
            detail="Usuario no disponible",
        )

    return user


def _require(user_class: type[User], detail: str):
    """Crea una dependencia de FastAPI que exige un usuario de cierta subclase."""

    def dependency(user: User = Depends(get_current_user)):  # noqa: B008
        """Verifica que el usuario autenticado pertenezca a la subclase requerida."""
        if not isinstance(user, user_class):
            raise HTTPException(status_code=403, detail=detail)
        return user

    return dependency


require_student = _require(StudentUser, "Solo disponible para estudiantes")
require_business = _require(BusinessUser, "Solo disponible para negocios")
require_admin = _require(AdminUser, "Solo disponible para administradores")
