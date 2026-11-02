
from sqlalchemy.orm import Session

from app.models.enums import NoiseLevel
from app.models.study_space import StudySpace
from app.repositories.study_space_repository import get_all_spaces


def list_spaces(
    session: Session,
    name: str | None = None,
    has_wifi: bool | None = None,
    has_outlets: bool | None = None,
    noise_level: NoiseLevel | None = None,
) -> list[StudySpace]:

    return get_all_spaces(
        session,
        name,
        has_wifi,
        has_outlets,
        noise_level,
    )
