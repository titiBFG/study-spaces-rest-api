
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
