from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.report import ReviewReport
    from app.models.review_vote import ReviewVote
    from app.models.study_space import StudySpace
    from app.models.user import StudentUser


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="ck_reviews_rating_range"),
        UniqueConstraint("user_id", "space_id", name="uq_reviews_user_space"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    rating: Mapped[int]
    comment: Mapped[str] = mapped_column(Text)
    images: Mapped[list[str]] = mapped_column(
        JSON, default=list, server_default=text("'[]'")
    )
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    space_id: Mapped[int] = mapped_column(
        ForeignKey("study_spaces.id", ondelete="CASCADE"), index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    author: Mapped["StudentUser"] = relationship(back_populates="reviews")
    space: Mapped["StudySpace"] = relationship(back_populates="reviews")
    reports: Mapped[list["ReviewReport"]] = relationship(
        back_populates="review", cascade="all, delete-orphan"
    )
    votes: Mapped[list["ReviewVote"]] = relationship(
        back_populates="review", cascade="all, delete-orphan"
    )

    def hide(self) -> None:
        """Oculta la reseña."""
        self.is_visible = False

    def restore(self) -> None:
        """Restaura la visibilidad de la reseña."""
        self.is_visible = True
