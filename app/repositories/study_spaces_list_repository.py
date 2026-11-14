from sqlalchemy.orm import Session

from app.models.list_item import ListItem
from app.models.study_space import StudySpace
from app.models.study_spaces_list import FavoritesList, StudySpacesList

LIST_CLASSES = {
    "custom": StudySpacesList,
    "favorites": FavoritesList,
}


# ---------------------------- Listas ----------------------------

def create_study_spaces_list(
    session: Session, name: str, user_id: int, list_type: str = "custom"
) -> StudySpacesList:
    """Crea una lista del tipo indicado ("custom" o "favorites").

    La columna `list_type` la completa SQLAlchemy según la clase elegida.
    """
    list_class = LIST_CLASSES.get(list_type)
    if list_class is None:
        raise ValueError(f"Tipo de lista inválido: {list_type}")

    study_spaces_list = list_class(name=name, user_id=user_id)
    session.add(study_spaces_list)
    session.commit()
    session.refresh(study_spaces_list)
    return study_spaces_list


def get_study_spaces_list_by_id(session: Session, list_id: int) -> StudySpacesList | None:
    """Devuelve la lista con ese id, o None si no existe."""
    return session.query(StudySpacesList).filter(StudySpacesList.id == list_id).first()


def get_study_spaces_lists_by_user_id(session: Session, user_id: int) -> list[StudySpacesList]:
    """Devuelve todas las listas de un usuario (incluida la de favoritos)."""
    return session.query(StudySpacesList).filter(StudySpacesList.user_id == user_id).all()


def get_favorites_list_by_user_id(session: Session, user_id: int) -> FavoritesList | None:
    """Devuelve la lista de favoritos del usuario, o None si todavía no tiene."""
    return session.query(FavoritesList).filter(FavoritesList.user_id == user_id).first()


def rename_study_spaces_list(
    session: Session, study_spaces_list: StudySpacesList, name: str
) -> StudySpacesList:
    """Cambia el nombre de una lista ya cargada."""
    study_spaces_list.name = name
    session.commit()
    session.refresh(study_spaces_list)
    return study_spaces_list


def delete_study_spaces_list(session: Session, study_spaces_list: StudySpacesList) -> None:
    """Elimina una lista ya cargada. Sus items se borran en cascada."""
    session.delete(study_spaces_list)
    session.commit()


# ----------------------------- Items ------------------------------

def get_list_item(session: Session, list_id: int, space_id: int) -> ListItem | None:
    """Devuelve el item (lista, espacio) si existe, o None.

    Sirve para saber si un espacio ya está en la lista antes de agregarlo.
    """
    return (
        session.query(ListItem)
        .filter(ListItem.list_id == list_id, ListItem.space_id == space_id)
        .first()
    )


def get_spaces_in_list(session: Session, list_id: int) -> list[StudySpace]:
    """Devuelve los espacios guardados en una lista.

    Consulta directamente la base en lugar de usar `lista.items`, porque esa
    colección puede quedar desactualizada si la sesión no expira los objetos
    al hacer commit (como pasa en este proyecto).
    """
    return (
        session.query(StudySpace)
        .join(ListItem, ListItem.space_id == StudySpace.id)
        .filter(ListItem.list_id == list_id)
        .all()
    )


def add_item_to_list(session: Session, list_id: int, space_id: int) -> ListItem:
    """Agrega un espacio a una lista.

    No verifica duplicados: el service debe consultar `get_list_item` antes.
    La restricción única de la base es la última defensa.
    """
    list_item = ListItem(list_id=list_id, space_id=space_id)
    session.add(list_item)
    session.commit()
    session.refresh(list_item)
    return list_item


def remove_item_from_list(session: Session, list_id: int, space_id: int) -> bool:
    """Quita un espacio de una lista. Devuelve False si no estaba en ella."""
    list_item = get_list_item(session, list_id, space_id)
    if list_item is None:
        return False

    session.delete(list_item)
    session.commit()
    return True
