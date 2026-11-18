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
