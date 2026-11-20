from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import UserRole


class UserCreate(BaseModel):
    """Datos de registro para crear una cuenta de estudiante o negocio."""

    full_name: str
    email: EmailStr
    password: str = Field(min_length=8)


class UserResponse(BaseModel):
    """Datos públicos de un usuario autenticado."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    role: UserRole


class UserLogin(BaseModel):
    """Credenciales de inicio de sesión."""

    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Respuesta de login con el token JWT y los datos del usuario."""

    access_token: str
    token_type: str
    user: UserResponse
