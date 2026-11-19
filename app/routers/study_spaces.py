from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.models.enums import NoiseLevel, NotificationEventType, UserRole
from app.models.study_space import StudySpace
from app.models.user import User
from app.schemas.study_space import StudySpaceCreate, StudySpaceResponse
from app.services.auth_service import get_current_user
from app.services.study_space_service import list_spaces
from app.services.notification_service import SpaceApprovalNotificationService

router = APIRouter(prefix="/spaces", tags=["spaces"])


@router.get("/", response_model=list[StudySpaceResponse])
def get_spaces(
    name: str | None = None,
    has_wifi: bool | None = None,
    has_outlets: bool | None = None,
    noise_level: NoiseLevel | None = None,
    session: Session = Depends(get_session),  # noqa: B008
):
    espacios = list_spaces(
        session,
        name,
        has_wifi,
        has_outlets,
        noise_level,
    )

    return [
        espacio for espacio in espacios
        if espacio.is_approved
    ]


@router.get("/mine", response_model=list[StudySpaceResponse])
def mis_espacios(
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    if user.role != UserRole.BUSINESS:
        raise HTTPException(status_code=403, detail="Solo para negocios")

    return session.query(StudySpace).filter(
        StudySpace.owner_id == user.id
    ).all()


@router.get("/pending", response_model=list[StudySpaceResponse])
def espacios_pendientes(
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Solo para administradores"
        )

    return session.query(StudySpace).filter(
        StudySpace.is_approved == False,
        StudySpace.is_rejected == False
    ).all()


@router.post("/", response_model=StudySpaceResponse, status_code=201)
def crear_espacio(
    datos: StudySpaceCreate,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    if user.role != UserRole.BUSINESS:
        raise HTTPException(status_code=403, detail="Solo para negocios")

    espacio = StudySpace(
        **datos.model_dump(),
        owner_id=user.id,
        is_approved=False,
        is_rejected=False
    )

    session.add(espacio)
    session.commit()
    session.refresh(espacio)

    SpaceApprovalNotificationService(session).notify_new_space(espacio)

    return espacio


@router.put("/{space_id}", response_model=StudySpaceResponse)
def editar_espacio(
    space_id: int,
    datos: StudySpaceCreate,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    if user.role != UserRole.BUSINESS:
        raise HTTPException(status_code=403, detail="Solo para negocios")

    espacio = session.get(StudySpace, space_id)

    if espacio is None:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")

    if espacio.owner_id != user.id:
        raise HTTPException(status_code=403, detail="No es tu espacio")

    for campo, valor in datos.model_dump().items():
        setattr(espacio, campo, valor)

    espacio.is_approved = False
    espacio.is_rejected = False

    session.commit()
    session.refresh(espacio)

    SpaceApprovalNotificationService(session).notify_new_space(espacio)

    return espacio


@router.patch("/{space_id}/approve", response_model=StudySpaceResponse)
def aprobar_espacio(
    space_id: int,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Solo para administradores"
        )

    espacio = session.get(StudySpace, space_id)

    if espacio is None:
        raise HTTPException(
            status_code=404,
            detail="Espacio no encontrado"
        )

    if espacio.is_rejected:
        raise HTTPException(
            status_code=400,
            detail="El espacio debe volver a revisión"
        )

    was_approved = espacio.is_approved
    espacio.is_approved = True
    espacio.is_rejected = False

    session.commit()
    session.refresh(espacio)

    if not was_approved:
        SpaceApprovalNotificationService(session).notify_space_approved(
            espacio
        )

        espacio.notify_observers(
            NotificationEventType.SPACE_UPDATED,
            f"{espacio.name} actualizó su información.",
        )

    return espacio


@router.patch("/{space_id}/reject", response_model=StudySpaceResponse)
def rechazar_espacio(
    space_id: int,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Solo para administradores"
        )

    espacio = session.get(StudySpace, space_id)

    if espacio is None:
        raise HTTPException(
            status_code=404,
            detail="Espacio no encontrado"
        )

    if espacio.is_approved or espacio.is_rejected:
        raise HTTPException(
            status_code=400,
            detail="El espacio no está pendiente de aprobación"
        )

    espacio.is_approved = False
    espacio.is_rejected = True

    session.commit()
    session.refresh(espacio)

    SpaceApprovalNotificationService(session).notify_space_rejected(
        espacio
    )

    return espacio