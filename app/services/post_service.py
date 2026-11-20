from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.enums import NotificationEventType
from app.models.post import Post
from app.models.study_space import StudySpace
from app.models.user import User
from app.repositories.post_repository import (
    create_post as create_post_in_db,
)
from app.repositories.post_repository import (
    delete_post as delete_post_in_db,
)
from app.repositories.post_repository import (
    get_active_posts_by_space_id,
    get_post_by_id,
    get_posts_by_author_id,
)
from app.repositories.post_repository import (
    update_post as update_post_in_db,
)
from app.repositories.study_space_repository import get_space_by_id
from app.schemas.post import PostCreate, PostUpdate

# ------------------------- Helpers internos -------------------------

def _get_existing_space(session: Session, space_id: int) -> StudySpace:
    """Devuelve el espacio de estudio o lanza 404 si no existe."""
    space = get_space_by_id(session, space_id)

    if space is None:
        raise HTTPException(
            status_code=404,
            detail="El espacio de estudio no existe",
        )

    return space


def _get_owned_space(session: Session, user: User, space_id: int) -> StudySpace:
    """Devuelve el espacio si existe y pertenece al negocio; si no, lanza error."""
    space = _get_existing_space(session, space_id)

    if space.owner_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="El espacio no pertenece al usuario",
        )

    return space


def _get_own_post(session: Session, user: User, post_id: int) -> Post:
    """Devuelve la publicación si existe y pertenece al negocio; si no, lanza error."""
    post = get_post_by_id(session, post_id)

    if post is None:
        raise HTTPException(status_code=404, detail="La publicación no existe")

    if post.author_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="La publicación no pertenece al usuario",
        )

    return post


# --------------------------- Publicaciones ---------------------------

def get_space_posts(session: Session, space_id: int) -> list[Post]:
    """Devuelve las publicaciones visibles de un espacio de estudio."""
    _get_existing_space(session, space_id)
    return get_active_posts_by_space_id(session, space_id)


def get_my_posts(session: Session, user: User) -> list[Post]:
    """Devuelve todas las publicaciones del negocio, incluidas las ocultas."""
    return get_posts_by_author_id(session, user.id)


def create_post(
    session: Session, user: User, space_id: int, data: PostCreate
) -> Post:
    """Publica algo en la página de un espacio del que el negocio es dueño."""
    space = _get_owned_space(session, user, space_id)

    post = create_post_in_db(
        session, user.id, space.id, data.title, data.content, data.images
    )
    space.notify_observers(
        NotificationEventType.NEW_POST,
        f"{space.name} publicó: {post.title}",
    )

    return post


def update_post(
    session: Session, user: User, post_id: int, data: PostUpdate
) -> Post:
    """Edita una publicación propia; solo cambia los campos enviados."""
    post = _get_own_post(session, user, post_id)
    return update_post_in_db(session, post, data.model_dump(exclude_unset=True))


def delete_post(session: Session, user: User, post_id: int) -> None:
    """Elimina una publicación propia."""
    post = _get_own_post(session, user, post_id)
    delete_post_in_db(session, post)
