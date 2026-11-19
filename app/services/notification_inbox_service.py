from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.enums import NotificationEventType, UserRole
from app.models.notification import InAppNotification
from app.models.user import User
from app.repositories.notification_repository import (
    count_unread_in_app_notifications,
    get_in_app_notification_by_id,
    get_in_app_notifications,
    get_preferences_by_user_id,
    save_notifications,
    save_preference,
)
from app.schemas.notification import PreferenceResponse, PreferenceUpdate
from app.services.notification_service import NOTIFICATION_CLASSES

# Eventos que puede recibir cada rol; son los que se pueden configurar.
EVENTS_BY_ROLE: dict[UserRole, list[NotificationEventType]] = {
    UserRole.STUDENT: [
        NotificationEventType.NEW_POST,
        NotificationEventType.SPACE_UPDATED,
        NotificationEventType.REVIEW_VOTED,
        NotificationEventType.CONTENT_MODERATED,
        NotificationEventType.REPORT_OUTCOME,
    ],
    UserRole.BUSINESS: [
        NotificationEventType.NEW_REVIEW,
        NotificationEventType.CONTENT_MODERATED,
        NotificationEventType.REPORT_OUTCOME,
    ],
    UserRole.ADMIN: [],
}


# ------------------------------ Bandeja ------------------------------

def get_my_notifications(
    session: Session, user: User, unread_only: bool = False
) -> list[InAppNotification]:
    """Devuelve las notificaciones in-app del usuario, de la más nueva a la más vieja."""
    return get_in_app_notifications(session, user.id, unread_only)


def get_unread_count(session: Session, user: User) -> int:
    """Devuelve cuántas notificaciones in-app sin leer tiene el usuario."""
    return count_unread_in_app_notifications(session, user.id)


def mark_as_read(
    session: Session, user: User, notification_id: int
) -> InAppNotification:
    """Marca como leída una notificación propia."""
    notification = get_in_app_notification_by_id(session, notification_id)

    if notification is None:
        raise HTTPException(status_code=404, detail="La notificación no existe")

    if notification.user_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="La notificación no pertenece al usuario",
        )

    notification.mark_as_read()
    save_notifications(session, [notification])
    return notification


def mark_all_as_read(session: Session, user: User) -> None:
    """Marca como leídas todas las notificaciones in-app del usuario."""
    unread = get_in_app_notifications(session, user.id, unread_only=True)

    for notification in unread:
        notification.mark_as_read()

    save_notifications(session, unread)


# ---------------------------- Preferencias ----------------------------

def get_my_preferences(session: Session, user: User) -> list[PreferenceResponse]:
    """Devuelve, por cada evento del rol y canal disponible, si está habilitado.

    Lo que el usuario nunca configuró figura como habilitado.
    """
    stored = {
        (preference.event_type, preference.channel): preference.is_enabled
        for preference in get_preferences_by_user_id(session, user.id)
    }

    return [
        PreferenceResponse(
            event_type=event_type,
            channel=channel,
            is_enabled=stored.get((event_type, channel), True),
        )
        for event_type in EVENTS_BY_ROLE[user.role]
        for channel in NOTIFICATION_CLASSES
    ]


def set_preference(
    session: Session, user: User, data: PreferenceUpdate
) -> PreferenceResponse:
    """Habilita o deshabilita un evento por un canal para el usuario."""
    if data.event_type not in EVENTS_BY_ROLE[user.role]:
        raise HTTPException(
            status_code=400,
            detail="Ese tipo de notificación no aplica a tu rol",
        )

    if data.channel not in NOTIFICATION_CLASSES:
        raise HTTPException(
            status_code=400,
            detail="Ese canal de notificaciones no está disponible",
        )

    preference = save_preference(
        session, user.id, data.event_type, data.channel, data.is_enabled
    )
    return PreferenceResponse(
        event_type=preference.event_type,
        channel=preference.channel,
        is_enabled=preference.is_enabled,
    )
