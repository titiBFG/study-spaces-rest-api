from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, object_session, relationship

from app.database.base import Base
from app.models.enums import NoiseLevel, NotificationEventType
from app.models.list_item import ListItem

if TYPE_CHECKING:
    from app.models.post import Post
    from app.models.report import StudySpaceReport
    from app.models.review import Review
    from app.models.user import BusinessUser, StudentUser


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
    image_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
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

    owner: Mapped["BusinessUser | None"] = relationship(back_populates="owned_spaces")
    reviews: Mapped[list["Review"]] = relationship(
        back_populates="space", cascade="all, delete-orphan"
    )
    posts: Mapped[list["Post"]] = relationship(
        back_populates="space", cascade="all, delete-orphan"
    )
    reports: Mapped[list["StudySpaceReport"]] = relationship(
        back_populates="space", cascade="all, delete-orphan"
    )
    list_items: Mapped[list["ListItem"]] = relationship(
        back_populates="space",
        cascade="all, delete-orphan"
    )

    def calculate_average_rating(self) -> float:
        visible_ratings = [
            review.rating
            for review in self.reviews
            if getattr(review, "is_visible", True)
        ]
        if not visible_ratings:
            return 0.0
        return round(sum(visible_ratings) / len(visible_ratings), 2)

    def count_reviews(self) -> int:
        return sum(
            1 for review in self.reviews if getattr(review, "is_visible", True)
        )

    @property
    def average_rating(self) -> float:
        """Promedio de calificaciones visibles (para exponerlo en la API)."""
        return self.calculate_average_rating()

    @property
    def reviews_count(self) -> int:
        """Cantidad de reseñas visibles (para exponerla en la API)."""
        return self.count_reviews()

    @property
    def observers(self) -> list["StudentUser"]:
        """Estudiantes que tienen este espacio en favoritos y quieren enterarse de sus novedades.

        Los observadores no se guardan aparte: guardar el espacio en favoritos
        es suscribirse y quitarlo es desuscribirse.
        """
        session = object_session(self)

        if session is None:
            return []

        # Imports locales para evitar imports circulares entre modelos.
        from app.models.study_spaces_list import FavoritesList
        from app.models.user import StudentUser

        return (
            session.query(StudentUser)
            .join(FavoritesList, FavoritesList.user_id == StudentUser.id)
            .join(ListItem, ListItem.list_id == FavoritesList.id)
            .filter(ListItem.space_id == self.id)
            .all()
        )

    def notify_observers(self, event_type: NotificationEventType, message: str) -> None:
        """Avisa a todos los observadores del espacio (patrón Observer)."""
        session = object_session(self)

        if session is None:
            return

        # Import local: el servicio depende de los modelos (evita el import circular).
        from app.services.notification_service import PromotionNotificationService

        PromotionNotificationService(session).broadcast(
            self.observers, event_type, message
        )
