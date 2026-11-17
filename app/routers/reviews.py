
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.models.review import Review
from app.models.study_space import StudySpace
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services.auth_service import get_current_user, require_student

router = APIRouter(prefix="/reviews", tags=["reviews"])


def preparar_resena(resena):
    return {
        "id": resena.id,
        "rating": resena.rating,
        "comment": resena.comment,
        "space_id": resena.space_id,
        "user_id": resena.user_id,
        "created_at": resena.created_at,
        "author_name": resena.author.full_name
    }


@router.get("/mine", response_model=list[ReviewResponse])
def mis_resenas(
    session: Session = Depends(get_session),
    user: User = Depends(require_student),
):
    resenas = session.query(Review).filter(
        Review.user_id == user.id
    ).all()

    return [preparar_resena(resena) for resena in resenas]


@router.get("/space/{space_id}", response_model=list[ReviewResponse])
def resenas_del_espacio(
    space_id: int,
    session: Session = Depends(get_session),
):
    resenas = session.query(Review).filter(
        Review.space_id == space_id,
        Review.is_visible == True
    ).all()

    return [preparar_resena(resena) for resena in resenas]


@router.post("/space/{space_id}", response_model=ReviewResponse, status_code=201)
def crear_resena(
    space_id: int,
    datos: ReviewCreate,
    session: Session = Depends(get_session),
    user: User = Depends(require_student),
):
    espacio = session.get(StudySpace, space_id)

    if espacio is None:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")

    anterior = session.query(Review).filter(
        Review.space_id == space_id,
        Review.user_id == user.id
    ).first()

    if anterior:
        raise HTTPException(
            status_code=400,
            detail="Ya publicaste una reseña para este espacio"
        )

    resena = Review(
        rating=datos.rating,
        comment=datos.comment,
        space_id=space_id,
        user_id=user.id
    )

    session.add(resena)
    session.commit()
    session.refresh(resena)

    return preparar_resena(resena)
