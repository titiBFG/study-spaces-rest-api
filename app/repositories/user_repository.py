from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_email(session: Session, email: str):
    """Devuelve el usuario registrado con ese correo, o None si no existe."""
    return session.query(User).filter(User.email == email).first()


def get_user_by_id(session: Session, user_id: int) -> User | None:
    """Devuelve el usuario con ese id, o None si no existe."""
    return session.query(User).filter(User.id == user_id).first()


def create_user(
    session: Session,
    user_class: type[User],
    full_name: str,
    email: str,
    hashed_password: str,
):
    """Crea un usuario de la subclase indicada (StudentUser, BusinessUser, ...)."""
    user = user_class(
        full_name=full_name,
        email=email,
        hashed_password=hashed_password,
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    return user
