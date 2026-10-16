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
