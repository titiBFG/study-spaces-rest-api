import bcrypt
import pytest
from sqlalchemy.exc import IntegrityError

from app.models import (
    Favorite,
    NoiseLevel,
    ReportStatus,
    Review,
    ReviewReport,
    StudySpace,
    User,
    UserRole,
)


def test_user_model_and_methods(session):
    raw_password = "SecretPassword123"
    hashed = bcrypt.hashpw(raw_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    user = User(
        email="student@unsam.edu.ar",
        hashed_password=hashed,
        full_name="Estudiante UNSAM",
        role=UserRole.STUDENT,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    assert user.id is not None
    assert user.is_student() is True
    assert user.is_admin() is False
    assert user.is_business() is False
    assert user.verify_password("SecretPassword123") is True
    assert user.verify_password("WrongPassword") is False


def test_study_space_and_reviews_relationships(session):
    # Create owner and student
    owner = User(
        email="cafe@unsam.edu.ar",
        hashed_password="hash",
        full_name="Dueño Cafe",
        role=UserRole.BUSINESS,
    )
    student1 = User(
        email="s1@unsam.edu.ar",
        hashed_password="hash",
        full_name="Alumno 1",
        role=UserRole.STUDENT,
    )
    student2 = User(
        email="s2@unsam.edu.ar",
        hashed_password="hash",
        full_name="Alumno 2",
        role=UserRole.STUDENT,
    )
    session.add_all([owner, student1, student2])
    session.commit()

    # Create space
    space = StudySpace(
        name="Biblioteca Central UNSAM",
        description="Espacio silencioso para estudio",
        address="Campus Miguelete 123",
        city="San Martín",
        latitude=-34.57,
        longitude=-58.53,
        has_wifi=True,
        has_outlets=True,
        noise_level=NoiseLevel.LOW,
        owner_id=owner.id,
    )
    session.add(space)
    session.commit()
    session.refresh(space)

    assert space.calculate_average_rating() == 0.0
    assert space.count_reviews() == 0

    # Add reviews
    review1 = Review(
        rating=5,
        comment="Excelente lugar",
        user_id=student1.id,
        space_id=space.id,
    )
    review2 = Review(
        rating=3,
        comment="A veces se llena",
        user_id=student2.id,
        space_id=space.id,
    )
    session.add_all([review1, review2])
    session.commit()
    session.refresh(space)

    assert space.count_reviews() == 2
    assert space.calculate_average_rating() == 4.0

    # Moderation: hide review2
    review2.hide()
    session.commit()
    session.refresh(space)

    assert space.count_reviews() == 1
    assert space.calculate_average_rating() == 5.0

    review2.restore()
    session.commit()
    session.refresh(space)
    assert space.count_reviews() == 2


def test_favorite_unique_constraint(session):
    user = User(
        email="fav_user@unsam.edu.ar",
        hashed_password="hash",
        full_name="Fav User",
        role=UserRole.STUDENT,
    )
    space = StudySpace(
        name="Café del Bosque",
        description="Café con enchufes",
        address="Av. Siempre Viva 742",
        city="San Martín",
        latitude=-34.58,
        longitude=-58.54,
        noise_level=NoiseLevel.MEDIUM,
    )
    session.add_all([user, space])
    session.commit()

    fav1 = Favorite(user_id=user.id, space_id=space.id)
    session.add(fav1)
    session.commit()

    fav2 = Favorite(user_id=user.id, space_id=space.id)
    session.add(fav2)
    with pytest.raises(IntegrityError):
        session.commit()
    session.rollback()


def test_review_report_workflow(session):
    student = User(
        email="author@unsam.edu.ar",
        hashed_password="hash",
        full_name="Review Author",
        role=UserRole.STUDENT,
    )
    reporter = User(
        email="reporter@unsam.edu.ar",
        hashed_password="hash",
        full_name="Report Person",
        role=UserRole.STUDENT,
    )
    space = StudySpace(
        name="Espacio Test",
        description="Desc",
        address="Calle 1",
        city="San Martín",
        latitude=-34.0,
        longitude=-58.0,
        noise_level=NoiseLevel.HIGH,
    )
    session.add_all([student, reporter, space])
    session.commit()

    review = Review(
        rating=1,
        comment="Spam inapropiado",
        user_id=student.id,
        space_id=space.id,
    )
    session.add(review)
    session.commit()

    report = ReviewReport(
        review_id=review.id,
        reporter_id=reporter.id,
        reason="Contenido ofensivo o spam",
    )
    session.add(report)
    session.commit()
    session.refresh(report)

    assert report.status == ReportStatus.PENDING
    report.resolve()
    assert report.status == ReportStatus.RESOLVED
    report.dismiss()
    assert report.status == ReportStatus.DISMISSED
