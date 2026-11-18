import pytest
from sqlalchemy.exc import IntegrityError

from app.models import (
    AdminUser,
    BusinessUser,
    NoiseLevel,
    Post,
    PostReport,
    Report,
    ReportStatus,
    Review,
    ReviewReport,
    StudentUser,
    StudySpace,
    StudySpaceReport,
    UserReport,
)
from app.services.auth_service import create_token

# ------------------------------ Helpers ------------------------------

def make_user(session, user_class, email, name="Usuario"):
    """Crea un usuario de la clase indicada directo en la base."""
    user = user_class(email=email, hashed_password="hash", full_name=name)
    session.add(user)
    session.commit()
    return user


def auth(user):
    """Header Authorization con un token válido para el usuario."""
    return {"Authorization": f"Bearer {create_token(user)}"}


def make_space(session, owner=None, name="Café del Bosque"):
    space = StudySpace(
        name=name,
        description="Café con enchufes",
        address="Av. Siempre Viva 742",
        city="San Martín",
        latitude=-34.58,
        longitude=-58.54,
        noise_level=NoiseLevel.MEDIUM,
        is_approved=True,
        owner_id=owner.id if owner else None,
    )
    session.add(space)
    session.commit()
    return space


def make_review(session, author, space, comment="Reseña de prueba"):
    review = Review(rating=3, comment=comment, user_id=author.id, space_id=space.id)
    session.add(review)
    session.commit()
    return review


def make_post(session, author, space, title="Promo"):
    post = Post(title=title, content="Texto", author_id=author.id, space_id=space.id)
    session.add(post)
    session.commit()
    return post


def report(client, user, path, reason="Contenido ofensivo"):
    return client.post(f"/reports/{path}", json={"reason": reason}, headers=auth(user))


# ------------------------------ Fixtures ------------------------------

@pytest.fixture
def student(session):
    return make_user(session, StudentUser, "ana@example.com", "Ana")


@pytest.fixture
def other_student(session):
    return make_user(session, StudentUser, "bruno@example.com", "Bruno")


@pytest.fixture
def business(session):
    return make_user(session, BusinessUser, "dueno@example.com", "Dueño")


@pytest.fixture
def admin(session):
    return make_user(session, AdminUser, "admin@example.com", "Admin")


@pytest.fixture
def space(session, business):
    return make_space(session, owner=business)


# ----------------------------- Modelos -----------------------------

def test_report_is_abstract():
    with pytest.raises(TypeError):
        Report(reason="x")


def test_resolving_review_report_hides_the_review(session, student, other_student, space):
    review = make_review(session, student, space)
    report_ = ReviewReport(review_id=review.id, reporter_id=other_student.id, reason="spam")
    session.add(report_)
    session.commit()

    report_.resolve()

    assert report_.status == ReportStatus.RESOLVED
    assert report_.resolved_at is not None
    assert review.is_visible is False


def test_resolving_post_report_hides_the_post(session, business, other_student, space):
    post = make_post(session, business, space)
    report_ = PostReport(post_id=post.id, reporter_id=other_student.id, reason="spam")
    session.add(report_)
    session.commit()

    report_.resolve()

    assert post.is_active is False


def test_resolving_user_report_deactivates_the_user(session, student, other_student):
    report_ = UserReport(
        reported_user_id=student.id, reporter_id=other_student.id, reason="acoso"
    )
    session.add(report_)
    session.commit()

    report_.resolve()

    assert student.is_active is False


def test_resolving_space_report_does_not_hide_the_space(session, other_student, space):
    report_ = StudySpaceReport(
        space_id=space.id, reporter_id=other_student.id, reason="datos falsos"
    )
    session.add(report_)
    session.commit()

    report_.resolve()

    assert report_.status == ReportStatus.RESOLVED
    assert space.is_approved is True


def test_dismissing_report_leaves_the_content_untouched(
    session, student, other_student, space
):
    review = make_review(session, student, space)
    report_ = ReviewReport(review_id=review.id, reporter_id=other_student.id, reason="spam")
    session.add(report_)
    session.commit()

    report_.dismiss()

    assert report_.status == ReportStatus.DISMISSED
    assert review.is_visible is True


def test_same_user_cannot_report_the_same_review_twice(
    session, student, other_student, space
):
    review = make_review(session, student, space)
    session.add(ReviewReport(review_id=review.id, reporter_id=other_student.id, reason="a"))
    session.commit()
    session.add(ReviewReport(review_id=review.id, reporter_id=other_student.id, reason="b"))

    with pytest.raises(IntegrityError):
        session.commit()
    session.rollback()


def test_deleting_a_review_deletes_its_reports(session, student, other_student, space):
    review = make_review(session, student, space)
    session.add(ReviewReport(review_id=review.id, reporter_id=other_student.id, reason="a"))
    session.commit()

    session.delete(review)
    session.commit()

    assert session.query(Report).count() == 0


# ------------------------- Crear reportes -------------------------

def test_report_review(client, session, student, other_student, space):
    review = make_review(session, student, space)

    response = report(client, other_student, f"reviews/{review.id}", reason="Es spam")

    assert response.status_code == 201
    body = response.json()
    assert body["type"] == "review"
    assert body["status"] == "pending"
    assert body["reason"] == "Es spam"
    assert body["review_id"] == review.id
    assert body["reporter_id"] == other_student.id
    assert body["post_id"] is None
    assert body["resolved_by_id"] is None


def test_report_post(client, session, business, other_student, space):
    post = make_post(session, business, space)

    response = report(client, other_student, f"posts/{post.id}")

    assert response.status_code == 201
    assert response.json()["type"] == "post"
    assert response.json()["post_id"] == post.id


def test_report_space(client, other_student, space):
    response = report(client, other_student, f"spaces/{space.id}", reason="Dirección falsa")

    assert response.status_code == 201
    assert response.json()["type"] == "study_space"
    assert response.json()["space_id"] == space.id


def test_report_user(client, student, other_student):
    response = report(client, other_student, f"users/{student.id}", reason="Acoso")

    assert response.status_code == 201
    assert response.json()["type"] == "user"
    assert response.json()["reported_user_id"] == student.id


def test_any_authenticated_user_can_report_including_business(
    client, session, student, business, space
):
    review = make_review(session, student, space)

    response = report(client, business, f"reviews/{review.id}")

    assert response.status_code == 201


def test_report_requires_authentication(client, session, student, space):
    review = make_review(session, student, space)

    response = client.post(f"/reports/reviews/{review.id}", json={"reason": "spam"})

    assert response.status_code in (401, 403)


def test_report_review_not_found(client, other_student):
    assert report(client, other_student, "reviews/9999").status_code == 404


def test_report_hidden_review_returns_404(client, session, student, other_student, space):
    review = make_review(session, student, space)
    review.hide()
    session.commit()

    assert report(client, other_student, f"reviews/{review.id}").status_code == 404


def test_report_post_not_found(client, other_student):
    assert report(client, other_student, "posts/9999").status_code == 404


def test_report_hidden_post_returns_404(client, session, business, other_student, space):
    post = make_post(session, business, space)
    post.hide()
    session.commit()

    assert report(client, other_student, f"posts/{post.id}").status_code == 404


def test_report_space_not_found(client, other_student):
    assert report(client, other_student, "spaces/9999").status_code == 404


def test_report_user_not_found(client, other_student):
    assert report(client, other_student, "users/9999").status_code == 404


def test_cannot_report_own_review(client, session, student, space):
    review = make_review(session, student, space)

    assert report(client, student, f"reviews/{review.id}").status_code == 403


def test_cannot_report_own_post(client, session, business, space):
    post = make_post(session, business, space)

    assert report(client, business, f"posts/{post.id}").status_code == 403


def test_cannot_report_own_space(client, business, space):
    assert report(client, business, f"spaces/{space.id}").status_code == 403


def test_cannot_report_yourself(client, student):
    assert report(client, student, f"users/{student.id}").status_code == 403


def test_cannot_report_an_admin(client, student, admin):
    assert report(client, student, f"users/{admin.id}").status_code == 403


def test_report_twice_returns_409(client, session, student, other_student, space):
    review = make_review(session, student, space)
    report(client, other_student, f"reviews/{review.id}")

    response = report(client, other_student, f"reviews/{review.id}")

    assert response.status_code == 409


def test_report_with_empty_reason_returns_422(client, session, student, other_student, space):
    review = make_review(session, student, space)

    response = report(client, other_student, f"reviews/{review.id}", reason="")

    assert response.status_code == 422


def test_my_reports_returns_only_own_reports(
    client, session, student, other_student, business, space
):
    review = make_review(session, student, space)
    report(client, other_student, f"reviews/{review.id}")
    report(client, business, f"reviews/{review.id}")

    response = client.get("/reports/mine", headers=auth(other_student))

    assert response.status_code == 200
    assert [item["reporter_id"] for item in response.json()] == [other_student.id]


# ------------------------- Moderación -------------------------

def test_only_admin_can_list_reports(client, student):
    assert client.get("/reports", headers=auth(student)).status_code == 403


def test_admin_lists_reports_with_filters(
    client, session, student, other_student, business, admin, space
):
    review = make_review(session, student, space)
    post = make_post(session, business, space)
    review_report_id = report(client, other_student, f"reviews/{review.id}").json()["id"]
    report(client, other_student, f"posts/{post.id}")
    client.put(f"/reports/{review_report_id}/dismiss", headers=auth(admin))

    everything = client.get("/reports", headers=auth(admin)).json()
    only_pending = client.get("/reports?status=pending", headers=auth(admin)).json()
    only_reviews = client.get("/reports?type=review", headers=auth(admin)).json()

    assert len(everything) == 2
    assert [item["type"] for item in only_pending] == ["post"]
    assert [item["id"] for item in only_reviews] == [review_report_id]


def test_admin_gets_report_detail(client, session, student, other_student, admin, space):
    review = make_review(session, student, space)
    report_id = report(client, other_student, f"reviews/{review.id}").json()["id"]

    response = client.get(f"/reports/{report_id}", headers=auth(admin))

    assert response.status_code == 200
    assert response.json()["id"] == report_id


def test_get_report_not_found(client, admin):
    assert client.get("/reports/9999", headers=auth(admin)).status_code == 404


def test_resolving_review_report_hides_review_from_public_list(
    client, session, student, other_student, admin, space
):
    review = make_review(session, student, space)
    report_id = report(client, other_student, f"reviews/{review.id}").json()["id"]

    response = client.put(f"/reports/{report_id}/resolve", headers=auth(admin))

    assert response.status_code == 200
    assert response.json()["status"] == "resolved"
    assert response.json()["resolved_by_id"] == admin.id
    assert response.json()["resolved_at"] is not None
    assert client.get(f"/reviews/space/{space.id}").json() == []


def test_resolving_post_report_hides_post_from_public_list(
    client, session, business, other_student, admin, space
):
    post = make_post(session, business, space)
    report_id = report(client, other_student, f"posts/{post.id}").json()["id"]

    client.put(f"/reports/{report_id}/resolve", headers=auth(admin))

    assert client.get(f"/posts/space/{space.id}").json() == []


def test_resolving_user_report_blocks_the_user(
    client, student, other_student, admin
):
    report_id = report(client, other_student, f"users/{student.id}").json()["id"]

    client.put(f"/reports/{report_id}/resolve", headers=auth(admin))

    assert client.get("/reviews/mine", headers=auth(student)).status_code == 401


def test_dismissing_report_keeps_the_content_visible(
    client, session, student, other_student, admin, space
):
    review = make_review(session, student, space)
    report_id = report(client, other_student, f"reviews/{review.id}").json()["id"]

    response = client.put(f"/reports/{report_id}/dismiss", headers=auth(admin))

    assert response.status_code == 200
    assert response.json()["status"] == "dismissed"
    assert response.json()["resolved_by_id"] == admin.id
    assert len(client.get(f"/reviews/space/{space.id}").json()) == 1


def test_cannot_manage_a_report_twice(
    client, session, student, other_student, admin, space
):
    review = make_review(session, student, space)
    report_id = report(client, other_student, f"reviews/{review.id}").json()["id"]
    client.put(f"/reports/{report_id}/resolve", headers=auth(admin))

    resolve_again = client.put(f"/reports/{report_id}/resolve", headers=auth(admin))
    dismiss_after = client.put(f"/reports/{report_id}/dismiss", headers=auth(admin))

    assert resolve_again.status_code == 409
    assert dismiss_after.status_code == 409


def test_only_admin_can_resolve_or_dismiss(
    client, session, student, other_student, space
):
    review = make_review(session, student, space)
    report_id = report(client, other_student, f"reviews/{review.id}").json()["id"]

    resolve = client.put(f"/reports/{report_id}/resolve", headers=auth(other_student))
    dismiss = client.put(f"/reports/{report_id}/dismiss", headers=auth(student))

    assert resolve.status_code == 403
    assert dismiss.status_code == 403


def test_resolve_report_not_found(client, admin):
    assert client.put("/reports/9999/resolve", headers=auth(admin)).status_code == 404
