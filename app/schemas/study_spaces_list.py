from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ListCreate(BaseModel):
    """Datos para crear o renombrar una lista de espacios."""

    name: str = Field(min_length=1, max_length=100)


class ListResponse(BaseModel):
    """Datos públicos de una lista de espacios de estudio."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    user_id: int
    list_type: str
    created_at: datetime


class ListItemCreate(BaseModel):
    """Identificador del espacio a agregar a una lista o a favoritos."""

    space_id: int


class ListItemResponse(BaseModel):
    """Relación creada al agregar un espacio a una lista."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    space_id: int
    list_id: int
