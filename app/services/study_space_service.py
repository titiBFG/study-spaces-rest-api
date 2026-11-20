
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.enums import NoiseLevel, NotificationEventType
from app.models.study_space import StudySpace
from app.models.user import BusinessUser
from app.repositories.study_space_repository import (
    get_all_spaces,
    get_pending_spaces,
    get_space_by_id,
    get_spaces_by_owner,
    save_space,
)
from app.schemas.study_space import StudySpaceCreate
from app.services.notification_service import SpaceApprovalNotificationService


def list_spaces(
    session: Session,
    name: str | None = None,
    has_wifi: bool | None = None,
    has_outlets: bool | None = None,
    noise_level: NoiseLevel | None = None,
) -> list[StudySpace]:
    """Devuelve los espacios de estudio aplicando los filtros opcionales."""
    return get_all_spaces(
        session,
        name,
        has_wifi,
        has_outlets,
        noise_level,
    )


def list_approved_spaces(
    session: Session,
    name: str | None = None,
    has_wifi: bool | None = None,
    has_outlets: bool | None = None,
    noise_level: NoiseLevel | None = None,
) -> list[StudySpace]:
    """Devuelve únicamente los espacios aprobados aplicando los filtros opcionales."""
    return [
        espacio
        for espacio in list_spaces(session, name, has_wifi, has_outlets, noise_level)
        if espacio.is_approved
    ]


def list_owner_spaces(session: Session, owner: BusinessUser) -> list[StudySpace]:
    """Devuelve los espacios creados por el negocio autenticado."""
    return get_spaces_by_owner(session, owner.id)


def list_pending_spaces(session: Session) -> list[StudySpace]:
    """Devuelve los espacios pendientes de revisión administrativa."""
    return get_pending_spaces(session)


def create_space(
    session: Session,
    owner: BusinessUser,
    datos: StudySpaceCreate,
) -> StudySpace:
    """Crea un nuevo espacio en estado pendiente y notifica a los administradores."""
    espacio = StudySpace(
        **datos.model_dump(),
        owner_id=owner.id,
        is_approved=False,
        is_rejected=False,
    )
    espacio = save_space(session, espacio)
    SpaceApprovalNotificationService(session).notify_new_space(espacio)
    return espacio


def update_space(
    session: Session,
    owner: BusinessUser,
    space_id: int,
    datos: StudySpaceCreate,
) -> StudySpace:
    """Actualiza un espacio propio, lo devuelve a revisión pendiente y avisa a admins."""
    espacio = get_space_by_id(session, space_id)
    if espacio is None:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
    if espacio.owner_id != owner.id:
        raise HTTPException(status_code=403, detail="No es tu espacio")

    for campo, valor in datos.model_dump().items():
        setattr(espacio, campo, valor)

    espacio.is_approved = False
    espacio.is_rejected = False
    espacio = save_space(session, espacio)
    SpaceApprovalNotificationService(session).notify_new_space(espacio)
    return espacio


def approve_space(session: Session, space_id: int) -> StudySpace:
    """Aprueba un espacio pendiente y notifica al dueño y a sus observadores."""
    espacio = get_space_by_id(session, space_id)
    if espacio is None:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
    if espacio.is_rejected:
        raise HTTPException(status_code=400, detail="El espacio debe volver a revisión")

    was_approved = espacio.is_approved
    espacio.is_approved = True
    espacio.is_rejected = False
    espacio = save_space(session, espacio)

    if not was_approved:
        SpaceApprovalNotificationService(session).notify_space_approved(espacio)
        espacio.notify_observers(
            NotificationEventType.SPACE_UPDATED,
            f"{espacio.name} actualizó su información.",
        )

    return espacio


def reject_space(session: Session, space_id: int) -> StudySpace:
    """Rechaza un espacio pendiente de aprobación y notifica a su dueño."""
    espacio = get_space_by_id(session, space_id)
    if espacio is None:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
    if espacio.is_approved or espacio.is_rejected:
        raise HTTPException(
            status_code=400,
            detail="El espacio no está pendiente de aprobación",
        )

    espacio.is_approved = False
    espacio.is_rejected = True
    espacio = save_space(session, espacio)
    SpaceApprovalNotificationService(session).notify_space_rejected(espacio)
    return espacio
