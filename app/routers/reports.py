from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.models.enums import ReportStatus, ReportType
from app.models.user import AdminUser, User
from app.schemas.report import ReportCreate, ReportResponse
from app.services import report_service
from app.services.auth_service import get_current_user, require_admin

router = APIRouter(prefix="/reports", tags=["reports"])


# ------------------- Reportar (cualquier usuario autenticado) -------------------

@router.post("/reviews/{review_id}", response_model=ReportResponse, status_code=201)
def report_review(
    review_id: int,
    data: ReportCreate,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Reporta una reseña por información falsa, agresiva o spam."""
    return report_service.report_review(session, user, review_id, data)


@router.post("/posts/{post_id}", response_model=ReportResponse, status_code=201)
def report_post(
    post_id: int,
    data: ReportCreate,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Reporta una publicación de un negocio."""
    return report_service.report_post(session, user, post_id, data)


@router.post("/spaces/{space_id}", response_model=ReportResponse, status_code=201)
def report_space(
    space_id: int,
    data: ReportCreate,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Reporta datos falsos o incorrectos de un espacio de estudio."""
    return report_service.report_space(session, user, space_id, data)


@router.post("/users/{user_id}", response_model=ReportResponse, status_code=201)
def report_user(
    user_id: int,
    data: ReportCreate,
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Reporta a un usuario por incumplir las normas de la comunidad."""
    return report_service.report_user(session, user, user_id, data)


@router.get("/mine", response_model=list[ReportResponse])
def get_my_reports(
    session: Session = Depends(get_session),  # noqa: B008
    user: User = Depends(get_current_user),  # noqa: B008
):
    """Devuelve los reportes que hizo el usuario autenticado, con su estado."""
    return report_service.get_my_reports(session, user)


# ------------------------- Moderación (administradores) -------------------------

@router.get("", response_model=list[ReportResponse])
def list_reports(
    status: ReportStatus | None = None,
    type: ReportType | None = None,
    session: Session = Depends(get_session),  # noqa: B008
    admin: AdminUser = Depends(require_admin),  # noqa: B008
):
    """Lista los reportes, filtrando opcionalmente por estado y tipo."""
    return report_service.list_reports(session, status, type)


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: int,
    session: Session = Depends(get_session),  # noqa: B008
    admin: AdminUser = Depends(require_admin),  # noqa: B008
):
    """Devuelve el detalle de un reporte."""
    return report_service.get_report(session, report_id)


@router.put("/{report_id}/resolve", response_model=ReportResponse)
def resolve_report(
    report_id: int,
    session: Session = Depends(get_session),  # noqa: B008
    admin: AdminUser = Depends(require_admin),  # noqa: B008
):
    """Da por válido el reporte: oculta la reseña o publicación, o bloquea al usuario."""
    return report_service.resolve_report(session, admin, report_id)


@router.put("/{report_id}/dismiss", response_model=ReportResponse)
def dismiss_report(
    report_id: int,
    session: Session = Depends(get_session),  # noqa: B008
    admin: AdminUser = Depends(require_admin),  # noqa: B008
):
    """Descarta el reporte sin tomar medidas."""
    return report_service.dismiss_report(session, admin, report_id)
