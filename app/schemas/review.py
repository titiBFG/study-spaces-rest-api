from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, model_validator

ImageUrl = Annotated[str, Field(min_length=1, max_length=1000)]


class ReviewCreate(BaseModel):
    """Datos requeridos para publicar una reseña."""

    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=1, max_length=1000)
    images: list[ImageUrl] = Field(default_factory=list, max_length=5)


class ReviewUpdate(BaseModel):
    """Edición parcial: solo se modifican los campos que se envían."""

    rating: int | None = Field(default=None, ge=1, le=5)
    comment: str | None = Field(default=None, min_length=1, max_length=1000)
    images: list[ImageUrl] | None = Field(default=None, max_length=5)

    @model_validator(mode="after")
    def at_least_one_field(self):
        """Valida que se envíe al menos un campo no nulo para actualizar."""
        if not self.model_fields_set:
            raise ValueError("Hay que enviar al menos un campo para editar")
        for field in self.model_fields_set:
            if getattr(self, field) is None:
                raise ValueError(f"El campo '{field}' no puede ser nulo")
        return self


class ReviewVoteCreate(BaseModel):
    """Voto de utilidad sobre una reseña."""

    is_useful: bool


class ReviewResponse(BaseModel):
    """Datos públicos de una reseña, incluyendo autor y conteo de votos."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    rating: int
    comment: str
    images: list[str]
    space_id: int
    user_id: int
    author_name: str
    created_at: datetime
    updated_at: datetime
    useful_votes: int = 0
    not_useful_votes: int = 0
