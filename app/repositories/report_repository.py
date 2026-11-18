from sqlalchemy.orm import Session

from app.models.enums import ReportStatus, ReportType
from app.models.report import Report

# ------------------------------ Reportes ------------------------------

def get_report_by_id(session: Session, report_id: int) -> Report | None:
    """Devuelve el reporte con ese id, o None si no existe."""
    return session.query(Report).filter(Report.id == report_id).first()


def get_reports(
    session: Session,
    status: ReportStatus | None = None,
    report_type: ReportType | None = None,
) -> list[Report]:
    """Devuelve los reportes, del más nuevo al más viejo, con filtros opcionales."""
    query = session.query(Report)

    if status is not None:
        query = query.filter(Report.status == status)

    if report_type is not None:
        query = query.filter(Report.type == report_type)

    return query.order_by(Report.created_at.desc(), Report.id.desc()).all()


def get_reports_by_reporter_id(session: Session, reporter_id: int) -> list[Report]:
    """Devuelve los reportes emitidos por un usuario."""
    return (
        session.query(Report)
        .filter(Report.reporter_id == reporter_id)
        .order_by(Report.created_at.desc(), Report.id.desc())
        .all()
    )


def find_report(
    session: Session, reporter_id: int, target_field: str, target_id: int
) -> Report | None:
    """Busca el reporte que un usuario ya hizo sobre un objetivo concreto.

    `target_field` es la columna del objetivo: "review_id", "post_id",
    "space_id" o "reported_user_id". Sirve para evitar reportes duplicados.
    """
    return (
        session.query(Report)
        .filter(
            Report.reporter_id == reporter_id,
            getattr(Report, target_field) == target_id,
        )
        .first()
    )


def save_report(session: Session, report: Report) -> Report:
    """Guarda un reporte nuevo o los cambios de uno ya existente."""
    session.add(report)
    session.commit()
    session.refresh(report)
    return report
