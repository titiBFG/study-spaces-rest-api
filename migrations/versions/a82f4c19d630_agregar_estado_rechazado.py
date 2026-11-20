"""Agregar estado rechazado a los espacios."""

from alembic import op
import sqlalchemy as sa


revision = "a82f4c19d630"
down_revision = "5760398264d0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "study_spaces",
        sa.Column(
            "is_rejected",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade() -> None:
    op.drop_column("study_spaces", "is_rejected")   