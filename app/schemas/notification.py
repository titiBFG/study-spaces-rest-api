from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import NotificationChannel, NotificationEventType


class NotificationResponse(BaseModel):
    """Representación pública de una notificación in-app."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    event_type: NotificationEventType
    channel: NotificationChannel
    message: str
    created_at: datetime
    sent_at: datetime | None
    read_at: datetime | None
    is_read: bool


class UnreadCountResponse(BaseModel):
    """Cantidad de notificaciones sin leer del usuario."""

    unread: int


class PreferenceUpdate(BaseModel):
    """Datos para habilitar o deshabilitar una preferencia de notificación."""

    event_type: NotificationEventType
    channel: NotificationChannel = NotificationChannel.IN_APP
    is_enabled: bool


class PreferenceResponse(BaseModel):
    """Estado de una preferencia de notificación para un evento y canal."""

    event_type: NotificationEventType
    channel: NotificationChannel
    is_enabled: bool
