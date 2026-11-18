from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.enums import ReportStatus, ReportType
from app.models.report import (
    PostReport,
    Report,
    ReviewReport,
    StudySpaceReport,
    UserReport,
)
from app.models.user import AdminUser, User
from app.repositories.post_repository import get_post_by_id
from app.repositories.report_repository import (
    find_report,
    get_report_by_id,
    get_reports,
    get_reports_by_reporter_id,
    save_report,
)
from app.repositories.review_repository import get_review_by_id
from app.repositories.study_space_repository import get_space_by_id
from app.repositories.user_repository import get_user_by_id
from app.schemas.report import ReportCreate

# ------------------------- Helpers internos -------------------------

def _create_report(
    session: Session,
    report_class: type[Report],
    reporter: User,
    reason: str,
    target_field: str,
    target_id: int,
) -> Report:
    """Crea el reporte del tipo indicado, salvo que el usuario ya lo haya hecho."""
    if find_report(session, reporter.id, target_field, target_id) is not None:
        raise HTTPException(
            status_code=409,
            detail="Ya reportaste esto",
        )

    report = report_class(
        reporter_id=reporter.id,
        reason=reason,
        **{target_field: target_id},
    )
    return save_report(session, report)


def _forbid_own_content(owner_id: int | None, reporter: User) -> None:
    """Un usuario no puede reportar contenido propio."""
    if owner_id == reporter.id:
        raise HTTPException(
            status_code=403,
            detail="No podés reportar tu propio contenido",
        )


def _get_pending_report(session: Session, report_id: int) -> Report:
    """Devuelve un reporte pendiente; 404 si no existe, 409 si ya fue gestionado."""
    report = get_report_by_id(session, report_id)

    if report is None:
        raise HTTPException(status_code=404, detail="El reporte no existe")

    if report.status != ReportStatus.PENDING:
        raise HTTPException(
            status_code=409,
            detail="El reporte ya fue gestionado",
        )

    return report


# ------------------------ Crear reportes ------------------------

def report_review(
    session: Session, user: User, review_id: int, data: ReportCreate
) -> Report:
    """Reporta una reseña visible que no sea del propio usuario."""
    review = get_review_by_id(session, review_id)

    if review is None or not review.is_visible:
        raise HTTPException(status_code=404, detail="La reseña no existe")

    _forbid_own_content(review.user_id, user)
    return _create_report(
        session, ReviewReport, user, data.reason, "review_id", review.id
    )


def report_post(
    session: Session, user: User, post_id: int, data: ReportCreate
) -> Report:
    """Reporta una publicación visible que no sea del propio usuario."""
    post = get_post_by_id(session, post_id)

    if post is None or not post.is_active:
        raise HTTPException(status_code=404, detail="La publicación no existe")

    _forbid_own_content(post.author_id, user)
    return _create_report(session, PostReport, user, data.reason, "post_id", post.id)


def report_space(
    session: Session, user: User, space_id: int, data: ReportCreate
) -> Report:
    """Reporta los datos de un espacio de estudio que no sea del propio usuario."""
    space = get_space_by_id(session, space_id)

    if space is None:
        raise HTTPException(
            status_code=404,
            detail="El espacio de estudio no existe",
        )

    _forbid_own_content(space.owner_id, user)
    return _create_report(
        session, StudySpaceReport, user, data.reason, "space_id", space.id
    )


def report_user(
    session: Session, user: User, reported_user_id: int, data: ReportCreate
) -> Report:
    """Reporta a otro usuario (no a uno mismo ni a un administrador)."""
    reported = get_user_by_id(session, reported_user_id)

    if reported is None:
        raise HTTPException(status_code=404, detail="El usuario no existe")

    if reported.id == user.id:
        raise HTTPException(
            status_code=403,
            detail="No podés reportarte a vos mismo",
        )

    if isinstance(reported, AdminUser):
        raise HTTPException(
            status_code=403,
            detail="No se puede reportar a un administrador",
        )

    return _create_report(
        session, UserReport, user, data.reason, "reported_user_id", reported.id
    )


def get_my_reports(session: Session, user: User) -> list[Report]:
    """Devuelve los reportes emitidos por el usuario, con su estado."""
    return get_reports_by_reporter_id(session, user.id)


# ------------------------ Moderación (administradores) ------------------------

def list_reports(
    session: Session,
    status: ReportStatus | None = None,
    report_type: ReportType | None = None,
) -> list[Report]:
    """Lista los reportes con filtros opcionales por estado y tipo."""
    return get_reports(session, status, report_type)


def get_report(session: Session, report_id: int) -> Report:
    """Devuelve un reporte o lanza 404 si no existe."""
    report = get_report_by_id(session, report_id)

    if report is None:
        raise HTTPException(status_code=404, detail="El reporte no existe")

    return report


def resolve_report(session: Session, admin: AdminUser, report_id: int) -> Report:
    """Da por válido un reporte pendiente y aplica la medida sobre lo reportado."""
    report = _get_pending_report(session, report_id)
    report.resolved_by_id = admin.id
    report.resolve()
    return save_report(session, report)


def dismiss_report(session: Session, admin: AdminUser, report_id: int) -> Report:
    """Descarta un reporte pendiente sin tomar medidas sobre lo reportado."""
    report = _get_pending_report(session, report_id)
    report.resolved_by_id = admin.id
    report.dismiss()
    return save_report(session, report)
