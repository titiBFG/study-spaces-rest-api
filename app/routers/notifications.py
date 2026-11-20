from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.models.user import User
from app.schemas.notification import (
    NotificationResponse,
    PreferenceResponse,
    PreferenceUpdate,
    UnreadCountResponse,
)
from app.services import notification_inbox_service
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
def get_my_notifications(
    unread_only: bool = False,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Devuelve las notificaciones del usuario (opcionalmente solo las sin leer)."""
    return notification_inbox_service.get_my_notifications(session, user, unread_only)


@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_count(
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Devuelve cuántas notificaciones sin leer tiene el usuario."""
    return UnreadCountResponse(
        unread=notification_inbox_service.get_unread_count(session, user)
    )


@router.get("/preferences", response_model=list[PreferenceResponse])
def get_my_preferences(
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Devuelve qué notificaciones recibe el usuario y por qué canal."""
    return notification_inbox_service.get_my_preferences(session, user)


@router.put("/preferences", response_model=PreferenceResponse)
def set_preference(
    data: PreferenceUpdate,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Habilita o deshabilita un tipo de notificación por un canal."""
    return notification_inbox_service.set_preference(session, user, data)


@router.put("/read-all", status_code=204)
def mark_all_as_read(
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Marca como leídas todas las notificaciones del usuario."""
    notification_inbox_service.mark_all_as_read(session, user)


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(
    notification_id: int,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Marca como leída una notificación propia."""
    return notification_inbox_service.mark_as_read(session, user, notification_id)
