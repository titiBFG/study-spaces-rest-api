
from pydantic import BaseModel, ConfigDict

from app.models.enums import NoiseLevel


class StudySpaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    address: str
    city: str
    latitude: float
    longitude: float
    has_wifi: bool
    has_outlets: bool
    noise_level: NoiseLevel
    opening_hours: str | None
