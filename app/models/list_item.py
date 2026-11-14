from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.study_space import StudySpace
    from app.models.study_spaces_list import StudySpacesList


class ListItem(Base):
    __tablename__ = "list_items"

    __table_args__ = (
        UniqueConstraint(
            "list_id",
            "space_id",
            name="uq_list_items_list_space"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    list_id: Mapped[int] = mapped_column(
        ForeignKey("study_spaces_lists.id", ondelete="CASCADE")
    )

    space_id: Mapped[int] = mapped_column(
        ForeignKey("study_spaces.id", ondelete="CASCADE")
    )

    study_spaces_list: Mapped["StudySpacesList"] = relationship(
        back_populates="items"
    )

    space: Mapped["StudySpace"] = relationship(
        back_populates="list_items"
    )