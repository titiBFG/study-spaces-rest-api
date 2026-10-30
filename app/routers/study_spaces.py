
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.schemas.study_space import StudySpaceResponse
from app.services.study_space_service import list_spaces

router = APIRouter(prefix="/spaces", tags=["spaces"])


@router.get("/", response_model=list[StudySpaceResponse])
def get_spaces(session: Session = Depends(get_session)):
    return list_spaces(session)
