from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, model_validator

ImageUrl = Annotated[str, Field(min_length=1, max_length=1000)]


class PostCreate(BaseModel):
    """Datos para crear una publicación de un negocio."""

    title: str = Field(min_length=1, max_length=160)
    content: str = Field(min_length=1, max_length=2000)
    images: list[ImageUrl] = Field(default_factory=list, max_length=5)


class PostUpdate(BaseModel):
    """Edición parcial: solo se modifican los campos que se envían."""

    title: str | None = Field(default=None, min_length=1, max_length=160)
    content: str | None = Field(default=None, min_length=1, max_length=2000)
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


class PostResponse(BaseModel):
    """Datos públicos de una publicación asociada a un espacio."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    images: list[str]
    is_active: bool
    space_id: int
    author_id: int
    author_name: str
    created_at: datetime
    updated_at: datetime
