from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.models.user import User
from app.schemas.review import (
    ReviewCreate,
    ReviewResponse,
    ReviewUpdate,
    ReviewVoteCreate,
)
from app.services import review_service
from app.services.auth_service import require_student

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/mine", response_model=list[ReviewResponse])
def get_my_reviews(
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(require_student),  # noqa: B008
):
    """Devuelve las reseñas escritas por el estudiante autenticado."""
    return review_service.get_my_reviews(session, user)


@router.get("/space/{space_id}", response_model=list[ReviewResponse])
def get_space_reviews(
    space_id: int,
    session: Session = Depends(get_session),  # noqa: B008
):
    """Devuelve las reseñas visibles de un espacio de estudio (acceso público)."""
    return review_service.get_space_reviews(session, space_id)


@router.post("/space/{space_id}", response_model=ReviewResponse, status_code=201)
def create_review(
    space_id: int,
    data: ReviewCreate,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(require_student),  # noqa: B008
):
    """Publica la reseña del estudiante sobre un espacio (una por espacio)."""
    return review_service.create_review(session, user, space_id, data)


@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    data: ReviewUpdate,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(require_student),  # noqa: B008
):
    """Edita una reseña propia; solo se modifican los campos enviados."""
    return review_service.update_review(session, user, review_id, data)


@router.delete("/{review_id}", status_code=204)
def delete_review(
    review_id: int,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(require_student),  # noqa: B008
):
    """Elimina una reseña propia."""
    review_service.delete_review(session, user, review_id)


@router.put("/{review_id}/vote", response_model=ReviewResponse)
def vote_review(
    review_id: int,
    data: ReviewVoteCreate,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(require_student),  # noqa: B008
):
    """Vota una reseña ajena como útil o no útil (reemplaza el voto anterior)."""
    return review_service.vote_review(session, user, review_id, data)


@router.delete("/{review_id}/vote", status_code=204)
def remove_vote(
    review_id: int,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(require_student),  # noqa: B008
):
    """Quita el voto del estudiante sobre una reseña."""
    review_service.remove_vote(session, user, review_id)
