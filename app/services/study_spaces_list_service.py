from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.enums import UserRole
from app.models.list_item import ListItem
from app.models.study_space import StudySpace
from app.models.study_spaces_list import FavoritesList, StudySpacesList
from app.models.user import User
from app.repositories.study_space_repository import get_space_by_id
from app.repositories.study_spaces_list_repository import (
    add_item_to_list,
    create_study_spaces_list,
    delete_study_spaces_list,
    get_favorites_list_by_user_id,
    get_list_item,
    get_spaces_in_list,
    get_study_spaces_list_by_id,
    get_study_spaces_lists_by_user_id,
    remove_item_from_list,
    rename_study_spaces_list,
)
from app.schemas.study_spaces_list import ListCreate

FAVORITES_LIST_NAME = "Favoritos"


# ------------------------- Helpers internos -------------------------

def _ensure_student(user: User) -> None:
    """Solo los estudiantes pueden crear listas y guardar favoritos."""
    if user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=403,
            detail="Solo los estudiantes pueden usar listas",
        )


def _get_user_list(session: Session, user: User, list_id: int) -> StudySpacesList:
    """Devuelve la lista si existe y pertenece al usuario; si no, lanza error."""
    study_spaces_list = get_study_spaces_list_by_id(session, list_id)

    if study_spaces_list is None:
        raise HTTPException(status_code=404, detail="La lista no existe")

    if study_spaces_list.user_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="La lista no pertenece al usuario",
        )

    return study_spaces_list


def _get_existing_space(session: Session, space_id: int) -> StudySpace:
    """Devuelve el espacio de estudio o lanza 404 si no existe."""
    space = get_space_by_id(session, space_id)

    if space is None:
        raise HTTPException(
            status_code=404,
            detail="El espacio de estudio no existe",
        )

    return space


def _ensure_not_favorites(study_spaces_list: StudySpacesList) -> None:
    """La lista de favoritos no se puede renombrar ni eliminar."""
    if isinstance(study_spaces_list, FavoritesList):
        raise HTTPException(
            status_code=400,
            detail="La lista de favoritos no se puede modificar ni eliminar",
        )


# ------------------------ Listas personalizadas ------------------------

def create_list(session: Session, user: User, data: ListCreate) -> StudySpacesList:
    """Crea una lista personalizada para el estudiante."""
    _ensure_student(user)
    return create_study_spaces_list(session, data.name, user.id, "custom")


def get_my_lists(session: Session, user: User) -> list[StudySpacesList]:
    """Devuelve todas las listas del usuario (incluida la de favoritos)."""
    return get_study_spaces_lists_by_user_id(session, user.id)


def get_list(session: Session, user: User, list_id: int) -> StudySpacesList:
    """Devuelve una lista del usuario."""
    return _get_user_list(session, user, list_id)


def rename_list(
    session: Session, user: User, list_id: int, data: ListCreate
) -> StudySpacesList:
    """Cambia el nombre de una lista personalizada del usuario."""
    study_spaces_list = _get_user_list(session, user, list_id)
    _ensure_not_favorites(study_spaces_list)
    return rename_study_spaces_list(session, study_spaces_list, data.name)


def delete_list(session: Session, user: User, list_id: int) -> None:
    """Elimina una lista personalizada del usuario."""
    study_spaces_list = _get_user_list(session, user, list_id)
    _ensure_not_favorites(study_spaces_list)
    delete_study_spaces_list(session, study_spaces_list)


def get_list_spaces(session: Session, user: User, list_id: int) -> list[StudySpace]:
    """Devuelve los espacios de estudio guardados en una lista del usuario."""
    study_spaces_list = _get_user_list(session, user, list_id)
    return get_spaces_in_list(session, study_spaces_list.id)


def add_space_to_list(
    session: Session, user: User, list_id: int, space_id: int
) -> ListItem:
    """Agrega un espacio a una lista del usuario."""
    study_spaces_list = _get_user_list(session, user, list_id)
    _get_existing_space(session, space_id)

    if get_list_item(session, study_spaces_list.id, space_id) is not None:
        raise HTTPException(
            status_code=409,
            detail="El espacio ya está en la lista",
        )

    return add_item_to_list(session, study_spaces_list.id, space_id)


def remove_space_from_list(
    session: Session, user: User, list_id: int, space_id: int
) -> None:
    """Quita un espacio de una lista del usuario."""
    study_spaces_list = _get_user_list(session, user, list_id)

    if not remove_item_from_list(session, study_spaces_list.id, space_id):
        raise HTTPException(
            status_code=404,
            detail="El espacio no está en la lista",
        )


# ------------------------------ Favoritos ------------------------------

def get_or_create_favorites_list(session: Session, user: User) -> FavoritesList:
    """Devuelve la lista de favoritos del estudiante, creándola si no existe.

    Garantiza que cada estudiante tenga una única lista de favoritos.
    """
    _ensure_student(user)

    favorites_list = get_favorites_list_by_user_id(session, user.id)
    if favorites_list is None:
        favorites_list = create_study_spaces_list(
            session, FAVORITES_LIST_NAME, user.id, "favorites"
        )

    return favorites_list


def get_favorites(session: Session, user: User) -> list[StudySpace]:
    """Devuelve los espacios favoritos del estudiante."""
    favorites_list = get_or_create_favorites_list(session, user)
    return get_spaces_in_list(session, favorites_list.id)


def add_favorite(session: Session, user: User, space_id: int) -> ListItem:
    """Agrega un espacio a los favoritos del estudiante."""
    favorites_list = get_or_create_favorites_list(session, user)
    return add_space_to_list(session, user, favorites_list.id, space_id)


def remove_favorite(session: Session, user: User, space_id: int) -> None:
    """Quita un espacio de los favoritos del estudiante."""
    favorites_list = get_or_create_favorites_list(session, user)
    remove_space_from_list(session, user, favorites_list.id, space_id)