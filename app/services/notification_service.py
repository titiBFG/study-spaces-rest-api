from abc import ABC, abstractmethod

from sqlalchemy.orm import Session

from app.models.enums import (
    NotificationChannel,
    NotificationEventType,
    ReportStatus,
)
from app.models.notification import InAppNotification, Notification
from app.models.report import Report
from app.models.review import Review
from app.models.user import User
from app.repositories.notification_repository import (
    get_preferences_by_user_id,
    save_notifications,
)

NOTIFICATION_CLASSES: dict[NotificationChannel, type[Notification]] = {
    NotificationChannel.IN_APP: InAppNotification,
}


class NotificationService(ABC):
    """Servicio base de notificaciones.

    ``send_notifications`` es un Template Method: el flujo es siempre el mismo
    (crear las notificaciones según las preferencias, entregarlas, guardarlas)
    y cada canal decide cómo entregar en su propio ``send()``. Los servicios
    concretos agrupan los eventos de un mismo dominio.
    """

    def __init__(self, session: Session):
        self.session = session

    @property
    @abstractmethod
    def event_types(self) -> frozenset[NotificationEventType]:
        """Eventos que este servicio sabe notificar."""

    def send_notifications(
        self, user: User, event_type: NotificationEventType, message: str
    ) -> list[Notification]:
        """Crea, entrega y guarda las notificaciones de un evento para un usuario."""
        return self.broadcast([user], event_type, message)

    def broadcast(
        self, users: list[User], event_type: NotificationEventType, message: str
    ) -> list[Notification]:
        """Notifica el mismo evento a varios usuarios, guardando todo junto."""
        notifications: list[Notification] = []

        for user in users:
            notifications.extend(self.create_notifications(user, event_type, message))

        for notification in notifications:
            notification.send()

        save_notifications(self.session, notifications)
        return notifications

    def create_notifications(
        self, user: User, event_type: NotificationEventType, message: str
    ) -> list[Notification]:
        """Crea una notificación por cada canal que el usuario tenga habilitado.

        No notifica a usuarios bloqueados. Es el punto de extensión para
        servicios que necesiten otra política de creación.
        """
        if event_type not in self.event_types:
            raise ValueError(
                f"{type(self).__name__} no maneja el evento {event_type.value}"
            )

        if not user.is_active:
            return []

        return [
            NOTIFICATION_CLASSES[channel](
                user_id=user.id, event_type=event_type, message=message
            )
            for channel in self._enabled_channels(user, event_type)
        ]

    def _enabled_channels(
        self, user: User, event_type: NotificationEventType
    ) -> list[NotificationChannel]:
        """Canales habilitados para el usuario: todos, salvo los que desactivó."""
        disabled = {
            preference.channel
            for preference in get_preferences_by_user_id(
                self.session, user.id, event_type
            )
            if not preference.is_enabled
        }
        return [channel for channel in NOTIFICATION_CLASSES if channel not in disabled]


class ModerationNotificationService(NotificationService):
    """Notificaciones del circuito de reportes y moderación."""

    event_types = frozenset(
        {NotificationEventType.REPORT_OUTCOME, NotificationEventType.CONTENT_MODERATED}
    )

    def notify_report_closed(self, report: Report) -> None:
        """Avisa a quien reportó cómo se resolvió su reporte."""
        if report.status == ReportStatus.RESOLVED:
            message = "Revisamos tu reporte y tomamos medidas sobre lo reportado."
        else:
            message = "Revisamos tu reporte y no encontramos una infracción."

        self.send_notifications(
            report.reporter, NotificationEventType.REPORT_OUTCOME, message
        )

    def notify_content_hidden(self, author: User, content: str) -> None:
        """Avisa al autor que su contenido fue ocultado tras un reporte."""
        self.send_notifications(
            author,
            NotificationEventType.CONTENT_MODERATED,
            f"Tu {content} fue ocultada por incumplir las normas de la comunidad.",
        )


class PromotionNotificationService(NotificationService):
    """Notificaciones de novedades de un espacio para quienes lo tienen en favoritos.

    Lo usa ``StudySpace.notify_observers``.
    """

    event_types = frozenset(
        {NotificationEventType.NEW_POST, NotificationEventType.SPACE_UPDATED}
    )


class ActivityNotificationService(NotificationService):
    """Notificaciones de la actividad sobre reseñas."""

    event_types = frozenset(
        {NotificationEventType.NEW_REVIEW, NotificationEventType.REVIEW_VOTED}
    )

    def notify_new_review(self, review: Review) -> None:
        """Avisa al dueño del espacio que recibió una reseña nueva."""
        space = review.space

        if space.owner is None:
            return

        self.send_notifications(
            space.owner,
            NotificationEventType.NEW_REVIEW,
            f"{review.author.full_name} dejó una reseña de {review.rating} "
            f"estrellas en {space.name}.",
        )

    def notify_review_voted(self, review: Review, is_useful: bool) -> None:
        """Avisa al autor de una reseña que otro estudiante la votó."""
        verdict = "útil" if is_useful else "no útil"
        self.send_notifications(
            review.author,
            NotificationEventType.REVIEW_VOTED,
            f"Alguien marcó como {verdict} tu reseña de {review.space.name}.",
        )
