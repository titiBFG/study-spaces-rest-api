from enum import Enum


class UserRole(str, Enum):
    STUDENT = "student"
    BUSINESS = "business"
    ADMIN = "admin"


class NoiseLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ReportStatus(str, Enum):
    PENDING = "pending"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class ReportType(str, Enum):
    REVIEW = "review"
    POST = "post"
    STUDY_SPACE = "study_space"
    USER = "user"


class NotificationChannel(str, Enum):
    IN_APP = "in_app"


class NotificationEventType(str, Enum):
    NEW_POST = "new_post"
    SPACE_UPDATED = "space_updated"
    REVIEW_VOTED = "review_voted"
    NEW_REVIEW = "new_review"
    CONTENT_MODERATED = "content_moderated"
    REPORT_OUTCOME = "report_outcome"
