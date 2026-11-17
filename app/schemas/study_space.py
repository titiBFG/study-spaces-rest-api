from pydantic import BaseModel, ConfigDict, Field

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
    image_url: str | None = None
    is_approved: bool
    average_rating: float = 0.0
    reviews_count: int = 0


class StudySpaceCreate(BaseModel):
    name: str
    description: str
    address: str
    city: str
    latitude: float
    longitude: float
    has_wifi: bool = False
    has_outlets: bool = False
    noise_level: NoiseLevel
    opening_hours: str | None = None
    image_url: str | None = Field(default=None, max_length=1000)
