from sqlalchemy import case, func
from sqlalchemy.orm import Session, joinedload

from app.models.review import Review
from app.models.review_vote import ReviewVote

# ---------------------------- Reseñas ----------------------------

def get_review_by_id(session: Session, review_id: int) -> Review | None:
    """Devuelve la reseña con ese id, o None si no existe."""
    return session.query(Review).filter(Review.id == review_id).first()


def get_visible_reviews_by_space_id(session: Session, space_id: int) -> list[Review]:
    """Devuelve las reseñas visibles de un espacio, de la más nueva a la más vieja."""
    return (
        session.query(Review)
        .options(joinedload(Review.author))
        .filter(Review.space_id == space_id, Review.is_visible.is_(True))
        .order_by(Review.created_at.desc(), Review.id.desc())
        .all()
    )


def get_reviews_by_user_id(session: Session, user_id: int) -> list[Review]:
    """Devuelve todas las reseñas escritas por un usuario."""
    return (
        session.query(Review)
        .options(joinedload(Review.author))
        .filter(Review.user_id == user_id)
        .order_by(Review.created_at.desc(), Review.id.desc())
        .all()
    )


def get_review_by_user_and_space(
    session: Session, user_id: int, space_id: int
) -> Review | None:
    """Devuelve la reseña de un usuario sobre un espacio, o None si no escribió.

    Sirve para evitar que un mismo estudiante reseñe dos veces el mismo lugar.
    """
    return (
        session.query(Review)
        .filter(Review.user_id == user_id, Review.space_id == space_id)
        .first()
    )


def create_review(
    session: Session,
    user_id: int,
    space_id: int,
    rating: int,
    comment: str,
    images: list[str],
) -> Review:
    """Crea y guarda una reseña.

    No verifica duplicados: el service debe consultar
    `get_review_by_user_and_space` antes. La restricción única de la base es
    la última defensa.
    """
    review = Review(
        user_id=user_id,
        space_id=space_id,
        rating=rating,
        comment=comment,
        images=images,
    )
    session.add(review)
    session.commit()
    session.refresh(review)
    return review


def update_review(session: Session, review: Review, changes: dict) -> Review:
    """Aplica los cambios indicados (campo -> valor) a una reseña ya cargada."""
    for field, value in changes.items():
        setattr(review, field, value)
    session.commit()
    session.refresh(review)
    return review


def delete_review(session: Session, review: Review) -> None:
    """Elimina una reseña ya cargada. Sus votos y reportes se borran en cascada."""
    session.delete(review)
    session.commit()


# ----------------------------- Votos ------------------------------

def get_vote(session: Session, review_id: int, user_id: int) -> ReviewVote | None:
    """Devuelve el voto de un usuario sobre una reseña, o None si no votó."""
    return (
        session.query(ReviewVote)
        .filter(ReviewVote.review_id == review_id, ReviewVote.user_id == user_id)
        .first()
    )


def save_vote(
    session: Session, review_id: int, user_id: int, is_useful: bool
) -> ReviewVote:
    """Registra el voto de un usuario; si ya había votado, lo reemplaza."""
    vote = get_vote(session, review_id, user_id)

    if vote is None:
        vote = ReviewVote(review_id=review_id, user_id=user_id, is_useful=is_useful)
        session.add(vote)
    else:
        vote.is_useful = is_useful

    session.commit()
    session.refresh(vote)
    return vote


def delete_vote(session: Session, vote: ReviewVote) -> None:
    """Elimina un voto ya cargado."""
    session.delete(vote)
    session.commit()


def get_vote_counts(
    session: Session, review_ids: list[int]
) -> dict[int, tuple[int, int]]:
    """Cuenta los votos de varias reseñas con una sola consulta.

    Devuelve `{review_id: (votos_utiles, votos_no_utiles)}`. Las reseñas sin
    votos no aparecen en el diccionario.

    Consulta directamente la base en lugar de usar `review.votes`, porque esa
    colección puede quedar desactualizada si la sesión no expira los objetos
    al hacer commit (como pasa en este proyecto).
    """
    if not review_ids:
        return {}

    rows = (
        session.query(
            ReviewVote.review_id,
            func.sum(case((ReviewVote.is_useful.is_(True), 1), else_=0)),
            func.count(ReviewVote.id),
        )
        .filter(ReviewVote.review_id.in_(review_ids))
        .group_by(ReviewVote.review_id)
        .all()
    )
    return {
        review_id: (int(useful), int(total) - int(useful))
        for review_id, useful, total in rows
    }
