from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, object_session, relationship

from app.database.base import Base
from app.models.enums import ReportStatus, ReportType

if TYPE_CHECKING:
    from app.models.post import Post
    from app.models.review import Review
    from app.models.study_space import StudySpace
    from app.models.user import AdminUser, User
    from app.services.notification_service import ModerationNotificationService


class Report(Base):
    """Clase base abstracta de todos los reportes (single-table inheritance).

    Todas las subclases comparten la tabla ``reports``; la columna ``type`` es
    el discriminador. Cada subclase usa solo la columna de su objetivo
    (``review_id``, ``post_id``, ``space_id`` o ``reported_user_id``) y deja
    las demás en NULL. No se puede instanciar directamente.

    ``resolve()`` y ``dismiss()`` siguen el patrón Template Method: el flujo
    es siempre el mismo (aplicar efecto, cerrar el reporte, notificar) y cada
    subclase personaliza los pasos ``_apply_resolution`` y ``_notify_observers``.
    """

    __tablename__ = "reports"
    __table_args__ = (
        UniqueConstraint(
            "reporter_id", "review_id", name="uq_reports_reporter_review"
        ),
        UniqueConstraint("reporter_id", "post_id", name="uq_reports_reporter_post"),
        UniqueConstraint(
            "reporter_id", "space_id", name="uq_reports_reporter_space"
        ),
        UniqueConstraint(
            "reporter_id", "reported_user_id", name="uq_reports_reporter_user"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[ReportType] = mapped_column(
        Enum(ReportType, native_enum=False), index=True
    )
    reason: Mapped[str] = mapped_column(Text)
    status: Mapped[ReportStatus] = mapped_column(
        Enum(ReportStatus, native_enum=False),
        default=ReportStatus.PENDING,
        index=True,
    )
    reporter_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    resolved_by_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    review_id: Mapped[int | None] = mapped_column(
        ForeignKey("reviews.id", ondelete="CASCADE"), index=True, nullable=True
    )
    post_id: Mapped[int | None] = mapped_column(
        ForeignKey("posts.id", ondelete="CASCADE"), index=True, nullable=True
    )
    space_id: Mapped[int | None] = mapped_column(
        ForeignKey("study_spaces.id", ondelete="CASCADE"), index=True, nullable=True
    )
    reported_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    reporter: Mapped["User"] = relationship(
        back_populates="reports", foreign_keys=[reporter_id]
    )
    resolved_by: Mapped["AdminUser | None"] = relationship(
        back_populates="managed_reports", foreign_keys=[resolved_by_id]
    )

    __mapper_args__ = {  # noqa: RUF012
        "polymorphic_on": "type",
    }

    def __init__(self, **kwargs):
        if type(self) is Report:
            raise TypeError(
                "Report es abstracta: usar ReviewReport, PostReport, "
                "StudySpaceReport o UserReport"
            )
        super().__init__(**kwargs)

    def resolve(self) -> None:
        """Da por válido el reporte: aplica la medida sobre lo reportado y lo cierra."""
        self._apply_resolution()
        self._close(ReportStatus.RESOLVED)

    def dismiss(self) -> None:
        """Descarta el reporte sin tomar ninguna medida sobre lo reportado."""
        self._close(ReportStatus.DISMISSED)

    def _close(self, new_status: ReportStatus) -> None:
        """Paso común: registra el nuevo estado y avisa a los interesados."""
        self.status = new_status
        self.resolved_at = datetime.now(UTC)
        self._notify_observers(new_status)

    def _apply_resolution(self) -> None:
        """Medida a tomar sobre lo reportado cuando se da por válido el reporte.

        Por defecto no hace nada. Las subclases lo sobrescriben.
        """

    def _notify_observers(self, new_status: ReportStatus) -> None:
        """Avisa a los interesados del cambio de estado del reporte.

        Por defecto avisa a quien reportó. Las subclases lo sobrescriben para
        avisar también al autor de lo reportado.
        """
        service = self._moderation_service()

        if service is not None:
            service.notify_report_closed(self)

    def _moderation_service(self) -> "ModerationNotificationService | None":
        """Servicio de notificaciones de moderación, o None si el reporte no está en una sesión."""
        session = object_session(self)

        if session is None:
            return None

        # Import local: el servicio depende de los modelos (evita el import circular).
        from app.services.notification_service import ModerationNotificationService

        return ModerationNotificationService(session)


class ReviewReport(Report):
    """Reporte de una reseña (información falsa, agresiva o spam)."""

    review: Mapped["Review"] = relationship(
        back_populates="reports", foreign_keys="Report.review_id"
    )

    __mapper_args__ = {  # noqa: RUF012
        "polymorphic_identity": ReportType.REVIEW,
    }

    def _apply_resolution(self) -> None:
        """Oculta la reseña reportada."""
        self.review.hide()

    def _notify_observers(self, new_status: ReportStatus) -> None:
        """Avisa a quien reportó y, si se ocultó la reseña, también a su autora o autor."""
        super()._notify_observers(new_status)
        service = self._moderation_service()

        if service is not None and new_status == ReportStatus.RESOLVED:
            service.notify_content_hidden(
                self.review.author, f"reseña de {self.review.space.name}"
            )


class PostReport(Report):
    """Reporte de una publicación de un negocio."""

    post: Mapped["Post"] = relationship(
        back_populates="reports", foreign_keys="Report.post_id"
    )

    __mapper_args__ = {  # noqa: RUF012
        "polymorphic_identity": ReportType.POST,
    }

    def _apply_resolution(self) -> None:
        """Oculta la publicación reportada."""
        self.post.hide()

    def _notify_observers(self, new_status: ReportStatus) -> None:
        """Avisa a quien reportó y, si se ocultó la publicación, también a su autor."""
        super()._notify_observers(new_status)
        service = self._moderation_service()

        if service is not None and new_status == ReportStatus.RESOLVED:
            service.notify_content_hidden(
                self.post.author, f"publicación «{self.post.title}»"
            )


class StudySpaceReport(Report):
    """Reporte de los datos de un espacio de estudio.

    No sobrescribe ``_apply_resolution``: cuando los datos son falsos, el
    administrador los corrige editando el espacio.
    """

    space: Mapped["StudySpace"] = relationship(
        back_populates="reports", foreign_keys="Report.space_id"
    )

    __mapper_args__ = {  # noqa: RUF012
        "polymorphic_identity": ReportType.STUDY_SPACE,
    }


class UserReport(Report):
    """Reporte de un usuario por incumplir las normas de la comunidad."""

    reported_user: Mapped["User"] = relationship(
        back_populates="received_reports", foreign_keys="Report.reported_user_id"
    )

    __mapper_args__ = {  # noqa: RUF012
        "polymorphic_identity": ReportType.USER,
    }

    def _apply_resolution(self) -> None:
        """Bloquea la cuenta del usuario reportado."""
        self.reported_user.is_active = False
