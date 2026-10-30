
from sqlalchemy.orm import Session

from app.models.study_space import StudySpace


def get_all_spaces(session: Session) -> list[StudySpace]:
    return session.query(StudySpace).all()
