from fastapi import HTTPException
from sqlalchemy.orm import Session
 
from app.models.review import Review
from app.models.user import User
from app.repositories.review_repository import (
    create_review as create_review_in_db,
)
from app.repositories.review_repository import (
    delete_review as delete_review_in_db,
)
from app.repositories.review_repository import (
    delete_vote,
    get_review_by_id,
    get_review_by_user_and_space,
    get_reviews_by_user_id,
    get_visible_reviews_by_space_id,
    get_vote,
    get_vote_counts,
    save_vote,
)
from app.repositories.review_repository import (
    update_review as update_review_in_db,
)
from app.repositories.study_space_repository import get_space_by_id
from app.schemas.review import (
    ReviewCreate,
    ReviewResponse,
    ReviewUpdate,
    ReviewVoteCreate,
)

# ------------------------- Helpers internos -------------------------

def _to_response(review: Review, votes: tuple[int, int] = (0, 0)) -> ReviewResponse:
    """Arma la respuesta de una reseña, sumándole el autor y los conteos de votos."""
    return ReviewResponse(
        id=review.id,
        rating=review.rating,
        comment=review.comment,
        images=review.images or [],
        space_id=review.space_id,
        user_id=review.user_id,
        author_name=review.author.full_name,
        created_at=review.created_at,
        updated_at=review.updated_at,
        useful_votes=votes[0],
        not_useful_votes=votes[1],
    )


def _to_responses(session: Session, reviews: list[Review]) -> list[ReviewResponse]:
    """Arma las respuestas de varias reseñas contando sus votos en una sola consulta."""
    counts = get_vote_counts(session, [review.id for review in reviews])
    return [_to_response(review, counts.get(review.id, (0, 0))) for review in reviews]


def _to_response_with_votes(session: Session, review: Review) -> ReviewResponse:
    """Arma la respuesta de una única reseña consultando sus votos."""
    return _to_responses(session, [review])[0]


def _get_existing_review(session: Session, review_id: int) -> Review:
    """Devuelve la reseña o lanza 404 si no existe."""
    review = get_review_by_id(session, review_id)

    if review is None:
        raise HTTPException(status_code=404, detail="La reseña no existe")

    return review


def _get_own_review(session: Session, user: User, review_id: int) -> Review:
    """Devuelve la reseña si existe y pertenece al usuario; si no, lanza error."""
    review = _get_existing_review(session, review_id)

    if review.user_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="La reseña no pertenece al usuario",
        )

    return review


def _get_votable_review(session: Session, user: User, review_id: int) -> Review:
    """Devuelve una reseña visible y ajena, que es la única que se puede votar."""
    review = _get_existing_review(session, review_id)

    if not review.is_visible:
        raise HTTPException(status_code=404, detail="La reseña no existe")

    if review.user_id == user.id:
        raise HTTPException(
            status_code=403,
            detail="No podés votar tu propia reseña",
        )

    return review


# ------------------------------ Reseñas ------------------------------

def get_space_reviews(session: Session, space_id: int) -> list[ReviewResponse]:
    """Devuelve las reseñas visibles de un espacio de estudio."""
    if get_space_by_id(session, space_id) is None:
        raise HTTPException(
            status_code=404,
            detail="El espacio de estudio no existe",
        )

    reviews = get_visible_reviews_by_space_id(session, space_id)
    return _to_responses(session, reviews)


def get_my_reviews(session: Session, user: User) -> list[ReviewResponse]:
    """Devuelve todas las reseñas escritas por el usuario."""
    return _to_responses(session, get_reviews_by_user_id(session, user.id))


def create_review(
    session: Session, user: User, space_id: int, data: ReviewCreate
) -> ReviewResponse:
    """Publica la reseña de un estudiante sobre un espacio (una por espacio)."""
    if get_space_by_id(session, space_id) is None:
        raise HTTPException(
            status_code=404,
            detail="El espacio de estudio no existe",
        )

    if get_review_by_user_and_space(session, user.id, space_id) is not None:
        raise HTTPException(
            status_code=409,
            detail="Ya publicaste una reseña para este espacio",
        )

    review = create_review_in_db(
        session, user.id, space_id, data.rating, data.comment, data.images
    )
    return _to_response(review)


def update_review(
    session: Session, user: User, review_id: int, data: ReviewUpdate
) -> ReviewResponse:
    """Edita una reseña propia; solo cambia los campos enviados."""
    review = _get_own_review(session, user, review_id)
    review = update_review_in_db(session, review, data.model_dump(exclude_unset=True))
    return _to_response_with_votes(session, review)


def delete_review(session: Session, user: User, review_id: int) -> None:
    """Elimina una reseña propia."""
    review = _get_own_review(session, user, review_id)
    delete_review_in_db(session, review)


# ------------------------------- Votos -------------------------------

def vote_review(
    session: Session, user: User, review_id: int, data: ReviewVoteCreate
) -> ReviewResponse:
    """Vota una reseña ajena como útil o no útil.

    Si el usuario ya había votado, su voto anterior se reemplaza.
    """
    review = _get_votable_review(session, user, review_id)
    save_vote(session, review.id, user.id, data.is_useful)
    return _to_response_with_votes(session, review)


def remove_vote(session: Session, user: User, review_id: int) -> None:
    """Quita el voto del usuario sobre una reseña."""
    review = _get_existing_review(session, review_id)
    vote = get_vote(session, review.id, user.id)

    if vote is None:
        raise HTTPException(
            status_code=404,
            detail="No votaste esta reseña",
        )

    delete_vote(session, vote)