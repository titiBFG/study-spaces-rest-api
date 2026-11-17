from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, String, Text, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.study_space import StudySpace
    from app.models.user import BusinessUser


class Post(Base):
    """Publicación de un negocio en la página de uno de sus espacios de estudio."""

    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(160))
    content: Mapped[str] = mapped_column(Text)
    images: Mapped[list[str]] = mapped_column(
        JSON, default=list, server_default=text("'[]'")
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    space_id: Mapped[int] = mapped_column(
        ForeignKey("study_spaces.id", ondelete="CASCADE"), index=True
    )
    author_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    space: Mapped["StudySpace"] = relationship(back_populates="posts")
    author: Mapped["BusinessUser"] = relationship(back_populates="posts")

    @property
    def author_name(self) -> str:
        """Nombre del negocio que publicó (para exponerlo en la API)."""
        return self.author.full_name

    def hide(self) -> None:
        """Oculta la publicación de la vista pública."""
        self.is_active = False

    def restore(self) -> None:
        """Vuelve a mostrar la publicación."""
        self.is_active = True
