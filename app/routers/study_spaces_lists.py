from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.models.user import User
from app.schemas.study_space import StudySpaceResponse
from app.schemas.study_spaces_list import (
    ListCreate,
    ListItemCreate,
    ListItemResponse,
    ListResponse,
)
from app.services import study_spaces_list_service as list_service
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/lists", tags=["lists"])
favorites_router = APIRouter(prefix="/favorites", tags=["favorites"])


# ------------------------ Listas personalizadas ------------------------

@router.post("", response_model=ListResponse, status_code=201)
def create_list(
    data: ListCreate,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Crea una lista personalizada para el estudiante autenticado."""
    return list_service.create_list(session, user, data)


@router.get("", response_model=list[ListResponse])
def get_my_lists(
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Devuelve las listas del usuario autenticado."""
    return list_service.get_my_lists(session, user)


@router.get("/{list_id}", response_model=ListResponse)
def get_list(
    list_id: int,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Devuelve una lista del usuario."""
    return list_service.get_list(session, user, list_id)


@router.patch("/{list_id}", response_model=ListResponse)
def rename_list(
    list_id: int,
    data: ListCreate,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Cambia el nombre de una lista personalizada."""
    return list_service.rename_list(session, user, list_id, data)


@router.delete("/{list_id}", status_code=204)
def delete_list(
    list_id: int,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Elimina una lista personalizada."""
    list_service.delete_list(session, user, list_id)


# --------------------- Espacios dentro de una lista ---------------------

@router.get("/{list_id}/spaces", response_model=list[StudySpaceResponse])
def get_list_spaces(
    list_id: int,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Devuelve los espacios guardados en una lista."""
    return list_service.get_list_spaces(session, user, list_id)


@router.post("/{list_id}/spaces", response_model=ListItemResponse, status_code=201)
def add_space_to_list(
    list_id: int,
    data: ListItemCreate,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Agrega un espacio de estudio a una lista."""
    return list_service.add_space_to_list(session, user, list_id, data.space_id)


@router.delete("/{list_id}/spaces/{space_id}", status_code=204)
def remove_space_from_list(
    list_id: int,
    space_id: int,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Quita un espacio de estudio de una lista."""
    list_service.remove_space_from_list(session, user, list_id, space_id)


# ------------------------------ Favoritos ------------------------------

@favorites_router.get("", response_model=list[StudySpaceResponse])
def get_favorites(
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Devuelve los espacios favoritos del estudiante."""
    return list_service.get_favorites(session, user)


@favorites_router.post("", response_model=ListItemResponse, status_code=201)
def add_favorite(
    data: ListItemCreate,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Agrega un espacio de estudio a los favoritos."""
    return list_service.add_favorite(session, user, data.space_id)


@favorites_router.delete("/{space_id}", status_code=204)
def remove_favorite(
    space_id: int,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Quita un espacio de estudio de los favoritos."""
    list_service.remove_favorite(session, user, space_id)