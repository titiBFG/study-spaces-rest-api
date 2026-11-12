
from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_email(session: Session, email: str):
    return session.query(User).filter(User.email == email).first()


def create_user(session: Session, full_name: str, email: str, hashed_password: str):
    user = User(
        full_name=full_name,
        email=email,
        hashed_password=hashed_password,
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    return user
