from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.models.enums import NoiseLevel
from app.models.user import AdminUser, BusinessUser
from app.schemas.study_space import StudySpaceCreate, StudySpaceResponse
from app.services import study_space_service
from app.services.auth_service import require_admin, require_business

router = APIRouter(prefix="/spaces", tags=["spaces"])


@router.get("/", response_model=list[StudySpaceResponse])
def get_spaces(
    name: str | None = None,
    has_wifi: bool | None = None,
    has_outlets: bool | None = None,
    noise_level: NoiseLevel | None = None,
    session: Session = Depends(get_session),  # noqa: B008
):
    return study_space_service.list_approved_spaces(
        session,
        name,
        has_wifi,
        has_outlets,
        noise_level,
    )


@router.get("/mine", response_model=list[StudySpaceResponse])
def mis_espacios(
    session: Session = Depends(get_session),  # noqa: B008
    user: BusinessUser = Depends(require_business),  # noqa: B008
):
    return study_space_service.list_owner_spaces(session, user)


@router.get("/pending", response_model=list[StudySpaceResponse])
def espacios_pendientes(
    session: Session = Depends(get_session),  # noqa: B008
    _admin: AdminUser = Depends(require_admin),  # noqa: B008
):
    return study_space_service.list_pending_spaces(session)


@router.post("/", response_model=StudySpaceResponse, status_code=201)
def crear_espacio(
    datos: StudySpaceCreate,
    session: Session = Depends(get_session),  # noqa: B008
    user: BusinessUser = Depends(require_business),  # noqa: B008
):
    return study_space_service.create_space(session, user, datos)


@router.put("/{space_id}", response_model=StudySpaceResponse)
def editar_espacio(
    space_id: int,
    datos: StudySpaceCreate,
    session: Session = Depends(get_session),  # noqa: B008
    user: BusinessUser = Depends(require_business),  # noqa: B008
):
    return study_space_service.update_space(session, user, space_id, datos)


@router.patch("/{space_id}/approve", response_model=StudySpaceResponse)
def aprobar_espacio(
    space_id: int,
    session: Session = Depends(get_session),  # noqa: B008
    _admin: AdminUser = Depends(require_admin),  # noqa: B008
):
    return study_space_service.approve_space(session, space_id)


@router.patch("/{space_id}/reject", response_model=StudySpaceResponse)
def rechazar_espacio(
    space_id: int,
    session: Session = Depends(get_session),  # noqa: B008
    _admin: AdminUser = Depends(require_admin),  # noqa: B008
):
    return study_space_service.reject_space(session, space_id)
