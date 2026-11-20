from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ReportStatus, ReportType


class ReportCreate(BaseModel):
    """Motivo enviado por el usuario para crear un reporte."""

    reason: str = Field(min_length=1, max_length=500)


class ReportResponse(BaseModel):
    """Datos de un reporte. Solo viene cargado el id de lo que se reportó."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    type: ReportType
    reason: str
    status: ReportStatus
    reporter_id: int
    review_id: int | None
    post_id: int | None
    space_id: int | None
    reported_user_id: int | None
    resolved_by_id: int | None
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None
