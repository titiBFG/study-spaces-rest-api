
from sqlalchemy.orm import Session

from app.models.study_space import StudySpace
from app.repositories.study_space_repository import get_all_spaces


def list_spaces(session: Session) -> list[StudySpace]:
    return get_all_spaces(session)
