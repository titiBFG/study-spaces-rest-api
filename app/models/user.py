from datetime import datetime
from typing import TYPE_CHECKING
 
import bcrypt
from sqlalchemy import Boolean, DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
 
from app.database.base import Base
from app.models.enums import UserRole
 
if TYPE_CHECKING:
    from app.models.post import Post
    from app.models.report import ReviewReport
    from app.models.review import Review
    from app.models.review_vote import ReviewVote
    from app.models.study_space import StudySpace
    from app.models.study_spaces_list import StudySpacesList


class User(Base):
    """Clase base abstracta de todos los usuarios (single-table inheritance).
 
    Todas las subclases comparten la tabla ``users``; la columna ``role`` es el
    discriminador que le indica a SQLAlchemy qué subclase instanciar al leer.
    No se puede instanciar directamente: hay que usar ``StudentUser``,
    ``BusinessUser`` o ``AdminUser``.
    """
 
    __tablename__ = "users"
 
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(120))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, native_enum=False))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    reports: Mapped[list["ReviewReport"]] = relationship(
        back_populates="reporter", cascade="all, delete-orphan"
    )
 
    __mapper_args__ = {  # noqa: RUF012
        "polymorphic_on": "role",
    }
 
    def __init__(self, **kwargs):
        if type(self) is User:
            raise TypeError(
                "User es abstracta: usar StudentUser, BusinessUser o AdminUser"
            )
        super().__init__(**kwargs)
 
    def verify_password(self, plain_password: str) -> bool:
        """Verifica una contraseña de texto plano contra el hash almacenado."""
        if not self.hashed_password:
            return False
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            self.hashed_password.encode("utf-8"),
        )


class StudentUser(User):
    """Estudiante: escribe reseñas y guarda espacios en listas y favoritos."""
 
    reviews: Mapped[list["Review"]] = relationship(
        back_populates="author", cascade="all, delete-orphan"
    )
    lists: Mapped[list["StudySpacesList"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    votes: Mapped[list["ReviewVote"]] = relationship(
        back_populates="voter", cascade="all, delete-orphan"
    )
 
    __mapper_args__ = {  # noqa: RUF012
        "polymorphic_identity": UserRole.STUDENT,
    }
 
 
class BusinessUser(User):
    """Negocio: gestiona los espacios de estudio de los que es dueño."""
 
    owned_spaces: Mapped[list["StudySpace"]] = relationship(back_populates="owner")
    posts: Mapped[list["Post"]] = relationship(
        back_populates="author", cascade="all, delete-orphan"
    )
 
    __mapper_args__ = {  # noqa: RUF012
        "polymorphic_identity": UserRole.BUSINESS,
    }
 
 
class AdminUser(User):
    """Administrador: modera contenido y gestiona solicitudes."""
 
    __mapper_args__ = {  # noqa: RUF012
        "polymorphic_identity": UserRole.ADMIN,
    }
