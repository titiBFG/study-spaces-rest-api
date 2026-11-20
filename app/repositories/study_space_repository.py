
from sqlalchemy.orm import Session

from app.models.enums import NoiseLevel
from app.models.study_space import StudySpace


def get_all_spaces(
    session: Session,
    name: str | None = None,
    has_wifi: bool | None = None,
    has_outlets: bool | None = None,
    noise_level: NoiseLevel | None = None,
) -> list[StudySpace]:
    """Consulta espacios de estudio filtrando por nombre, WiFi, enchufes y ruido."""
    query = session.query(StudySpace)

    if name:
        query = query.filter(StudySpace.name.ilike(f"%{name}%"))

    if has_wifi is not None:
        query = query.filter(StudySpace.has_wifi == has_wifi)

    if has_outlets is not None:
        query = query.filter(StudySpace.has_outlets == has_outlets)

    if noise_level is not None:
        query = query.filter(StudySpace.noise_level == noise_level)

    return query.all()

def get_space_by_id(session: Session, space_id: int) -> StudySpace | None:
    """Devuelve el espacio de estudio con ese id, o None si no existe."""
    return session.query(StudySpace).filter(StudySpace.id == space_id).first()


def get_spaces_by_owner(session: Session, owner_id: int) -> list[StudySpace]:
    """Devuelve todos los espacios pertenecientes a un negocio."""
    return session.query(StudySpace).filter(StudySpace.owner_id == owner_id).all()


def get_pending_spaces(session: Session) -> list[StudySpace]:
    """Devuelve los espacios pendientes de aprobación (ni aprobados ni rechazados)."""
    return (
        session.query(StudySpace)
        .filter(
            StudySpace.is_approved.is_(False),
            StudySpace.is_rejected.is_(False),
        )
        .all()
    )


def save_space(session: Session, space: StudySpace) -> StudySpace:
    """Persiste un espacio nuevo o modificado y refresca su estado desde la DB."""
    session.add(space)
    session.commit()
    session.refresh(space)
    return space
