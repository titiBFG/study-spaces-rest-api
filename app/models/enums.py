from enum import Enum


class UserRole(str, Enum):
    """Roles de usuario disponibles en la plataforma."""

    STUDENT = "student"
    BUSINESS = "business"
    ADMIN = "admin"


class NoiseLevel(str, Enum):
    """Niveles de ruido declarados para un espacio de estudio."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ReportStatus(str, Enum):
    """Estados posibles en el ciclo de vida de un reporte."""

    PENDING = "pending"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class ReportType(str, Enum):
    """Tipos de entidad que pueden ser reportadas."""

    REVIEW = "review"
    POST = "post"
    STUDY_SPACE = "study_space"
    USER = "user"


class NotificationChannel(str, Enum):
    """Canales de entrega soportados para las notificaciones."""

    IN_APP = "in_app"


class NotificationEventType(str, Enum):
    """Tipos de eventos que disparan notificaciones."""

    NEW_POST = "new_post"
    SPACE_UPDATED = "space_updated"
    REVIEW_VOTED = "review_voted"
    NEW_REVIEW = "new_review"
    CONTENT_MODERATED = "content_moderated"
    REPORT_OUTCOME = "report_outcome"
    SPACE_PENDING = "space_pending"
    SPACE_APPROVED = "space_approved"
    SPACE_REJECTED = "space_rejected"