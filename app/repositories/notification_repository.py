from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.enums import NotificationChannel, NotificationEventType
from app.models.notification import InAppNotification, Notification
from app.models.notification_preference import NotificationPreference

# --------------------------- Notificaciones ---------------------------

def save_notifications(session: Session, notifications: list[Notification]) -> None:
    """Guarda varias notificaciones nuevas (o los cambios en ellas) de una vez."""
    if not notifications:
        return

    session.add_all(notifications)
    session.commit()


def get_in_app_notifications(
    session: Session, user_id: int, unread_only: bool = False
) -> list[InAppNotification]:
    """Devuelve la bandeja in-app de un usuario, de la más nueva a la más vieja."""
    query = session.query(InAppNotification).filter(
        InAppNotification.user_id == user_id
    )

    if unread_only:
        query = query.filter(InAppNotification.read_at.is_(None))

    return query.order_by(
        InAppNotification.created_at.desc(), InAppNotification.id.desc()
    ).all()


def get_in_app_notification_by_id(
    session: Session, notification_id: int
) -> InAppNotification | None:
    """Devuelve la notificación in-app con ese id, o None si no existe."""
    return (
        session.query(InAppNotification)
        .filter(InAppNotification.id == notification_id)
        .first()
    )


def count_unread_in_app_notifications(session: Session, user_id: int) -> int:
    """Cuenta las notificaciones in-app sin leer de un usuario."""
    return (
        session.query(func.count(InAppNotification.id))
        .filter(
            InAppNotification.user_id == user_id,
            InAppNotification.read_at.is_(None),
        )
        .scalar()
    )


# ----------------------------- Preferencias -----------------------------

def get_preferences_by_user_id(
    session: Session,
    user_id: int,
    event_type: NotificationEventType | None = None,
) -> list[NotificationPreference]:
    """Devuelve las preferencias guardadas de un usuario (opcionalmente de un evento)."""
    query = session.query(NotificationPreference).filter(
        NotificationPreference.user_id == user_id
    )

    if event_type is not None:
        query = query.filter(NotificationPreference.event_type == event_type)

    return query.all()


def save_preference(
    session: Session,
    user_id: int,
    event_type: NotificationEventType,
    channel: NotificationChannel,
    is_enabled: bool,
) -> NotificationPreference:
    """Guarda la preferencia de un usuario; si ya existía, la actualiza."""
    preference = (
        session.query(NotificationPreference)
        .filter(
            NotificationPreference.user_id == user_id,
            NotificationPreference.event_type == event_type,
            NotificationPreference.channel == channel,
        )
        .first()
    )

    if preference is None:
        preference = NotificationPreference(
            user_id=user_id,
            event_type=event_type,
            channel=channel,
            is_enabled=is_enabled,
        )
        session.add(preference)
    else:
        preference.is_enabled = is_enabled

    session.commit()
    session.refresh(preference)
    return preference
