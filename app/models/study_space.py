from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.enums import NoiseLevel

if TYPE_CHECKING:
    from app.models.favorite import Favorite
    from app.models.review import Review
    from app.models.user import User


class StudySpace(Base):
    __tablename__ = "study_spaces"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160), index=True)
    description: Mapped[str] = mapped_column(Text)
    address: Mapped[str] = mapped_column(String(255))
    city: Mapped[str] = mapped_column(String(120), index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    has_wifi: Mapped[bool] = mapped_column(Boolean, default=False)
    has_outlets: Mapped[bool] = mapped_column(Boolean, default=False)
    noise_level: Mapped[NoiseLevel] = mapped_column(
        Enum(NoiseLevel, native_enum=False)
    )
    opening_hours: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    owner_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    owner: Mapped["User | None"] = relationship(back_populates="owned_spaces")
    reviews: Mapped[list["Review"]] = relationship(
        back_populates="space", cascade="all, delete-orphan"
    )
    favorites: Mapped[list["Favorite"]] = relationship(
        back_populates="space", cascade="all, delete-orphan"
    )

    def calculate_average_rating(self) -> float:
        """Calculate average rating based on visible reviews."""
        visible_ratings = [
            review.rating
            for review in self.reviews
            if getattr(review, "is_visible", True)
        ]
        if not visible_ratings:
            return 0.0
        return round(sum(visible_ratings) / len(visible_ratings), 2)

    def count_reviews(self) -> int:
        """Count total visible reviews."""
        return sum(
            1 for review in self.reviews if getattr(review, "is_visible", True)
        )
