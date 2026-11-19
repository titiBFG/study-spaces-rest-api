from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.enums import NotificationChannel, NotificationEventType

if TYPE_CHECKING:
    from app.models.user import User


class Notification(Base):
    """Clase base abstracta de las notificaciones (single-table inheritance).

    La columna ``channel`` es el discriminador: cada canal de entrega es una
    subclase que decide qué significa "enviar" (``send``). Para agregar un
    canal nuevo (por ejemplo email) hay que sumar su valor a
    ``NotificationChannel``, crear la subclase y registrarla en
    ``NOTIFICATION_CLASSES`` (``app/services/notification_service.py``).
    """

    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    channel: Mapped[NotificationChannel] = mapped_column(
        Enum(NotificationChannel, native_enum=False, length=30), index=True
    )
    event_type: Mapped[NotificationEventType] = mapped_column(
        Enum(NotificationEventType, native_enum=False, length=40)
    )
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    user: Mapped["User"] = relationship(back_populates="notifications")

    __mapper_args__ = {  # noqa: RUF012
        "polymorphic_on": "channel",
    }

    def __init__(self, **kwargs):
        if type(self) is Notification:
            raise TypeError(
                "Notification es abstracta: usar una subclase de canal "
                "(por ejemplo InAppNotification)"
            )
        super().__init__(**kwargs)

    def send(self) -> None:
        """Entrega la notificación por su canal. Cada subclase lo implementa."""
        raise NotImplementedError


class InAppNotification(Notification):
    """Notificación dentro de la aplicación: queda en la bandeja del usuario."""

    read_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    __mapper_args__ = {  # noqa: RUF012
        "polymorphic_identity": NotificationChannel.IN_APP,
    }

    @property
    def is_read(self) -> bool:
        """Indica si el usuario ya la leyó."""
        return self.read_at is not None

    def send(self) -> None:
        """La entrega in-app consiste en dejarla disponible en la bandeja."""
        self.sent_at = datetime.now(UTC)

    def mark_as_read(self) -> None:
        """Marca la notificación como leída (si ya lo estaba, no cambia nada)."""
        if self.read_at is None:
            self.read_at = datetime.now(UTC)
