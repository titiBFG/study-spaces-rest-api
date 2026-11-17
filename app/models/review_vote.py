from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.review import Review
    from app.models.user import StudentUser


class ReviewVote(Base):
    """Voto de un estudiante sobre si una reseña le resultó útil o no.

    Cada estudiante puede tener un único voto por reseña.
    """

    __tablename__ = "review_votes"
    __table_args__ = (
        UniqueConstraint("review_id", "user_id", name="uq_review_votes_review_user"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    is_useful: Mapped[bool] = mapped_column(Boolean)
    review_id: Mapped[int] = mapped_column(
        ForeignKey("reviews.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    review: Mapped["Review"] = relationship(back_populates="votes")
    voter: Mapped["StudentUser"] = relationship(back_populates="votes")
