from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.models.user import User
from app.schemas.post import PostCreate, PostResponse, PostUpdate
from app.services import post_service
from app.services.auth_service import require_business

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get("/mine", response_model=list[PostResponse])
def get_my_posts(
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(require_business),  # noqa: B008
):
    """Devuelve las publicaciones del negocio autenticado, incluidas las ocultas."""
    return post_service.get_my_posts(session, user)


@router.get("/space/{space_id}", response_model=list[PostResponse])
def get_space_posts(
    space_id: int,
    session: Session = Depends(get_session),  # noqa: B008
):
    """Devuelve las publicaciones visibles de un espacio de estudio (acceso público)."""
    return post_service.get_space_posts(session, space_id)


@router.post("/space/{space_id}", response_model=PostResponse, status_code=201)
def create_post(
    space_id: int,
    data: PostCreate,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(require_business),  # noqa: B008
):
    """Publica algo en la página de un espacio propio del negocio."""
    return post_service.create_post(session, user, space_id, data)


@router.put("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: int,
    data: PostUpdate,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(require_business),  # noqa: B008
):
    """Edita una publicación propia; solo se modifican los campos enviados."""
    return post_service.update_post(session, user, post_id, data)


@router.delete("/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(require_business),  # noqa: B008
):
    """Elimina una publicación propia."""
    post_service.delete_post(session, user, post_id)
