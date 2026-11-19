from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import NotificationChannel, NotificationEventType


class NotificationResponse(BaseModel):
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
    unread: int


class PreferenceUpdate(BaseModel):
    event_type: NotificationEventType
    channel: NotificationChannel = NotificationChannel.IN_APP
    is_enabled: bool


class PreferenceResponse(BaseModel):
    event_type: NotificationEventType
    channel: NotificationChannel
    is_enabled: bool
