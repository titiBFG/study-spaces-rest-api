from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.list_item import ListItem
    from app.models.user import StudentUser


class StudySpacesList(Base):
    """Lista personalizada de espacios de estudio creada por un estudiante."""

    __tablename__ = "study_spaces_lists"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(Text)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    list_type: Mapped[str] = mapped_column(String(20), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["StudentUser"] = relationship(
        back_populates="lists"
    )

    items: Mapped[list["ListItem"]] = relationship(
        back_populates="study_spaces_list",
        cascade="all, delete-orphan"
    )

    __mapper_args__ = {  # noqa: RUF012
        "polymorphic_on": list_type,
        "polymorphic_identity": "custom"
    }

class FavoritesList(StudySpacesList):
    """Lista única de favoritos de un estudiante (suscribe al patrón Observer)."""

    __mapper_args__ = {  # noqa: RUF012
        "polymorphic_identity": "favorites"
    }
