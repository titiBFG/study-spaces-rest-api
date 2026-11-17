import pytest
from sqlalchemy.exc import IntegrityError

from app.models import (
    BusinessUser,
    NoiseLevel,
    Review,
    ReviewVote,
    StudySpace,
)
from app.services.auth_service import create_token

# ------------------------------ Helpers ------------------------------

def register_and_login(client, email):
    """Registra un estudiante y devuelve el header Authorization."""
    client.post(
        "/users/register/student",
        json={"full_name": "Test User", "email": email, "password": "password123"},
    )
    response = client.post(
        "/users/login", json={"email": email, "password": "password123"}
    )
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def make_space(session, name="Café del Bosque", approved=False):
    space = StudySpace(
        name=name,
        description="Café con enchufes",
        address="Av. Siempre Viva 742",
        city="San Martín",
        latitude=-34.58,
        longitude=-58.54,
        noise_level=NoiseLevel.MEDIUM,
        is_approved=approved,
    )
    session.add(space)
    session.commit()
    return space


def post_review(client, headers, space_id, rating=4, comment="Muy tranquilo", **extra):
    return client.post(
        f"/reviews/space/{space_id}",
        json={"rating": rating, "comment": comment, **extra},
        headers=headers,
    )


def vote(client, headers, review_id, is_useful=True):
    return client.put(
        f"/reviews/{review_id}/vote", json={"is_useful": is_useful}, headers=headers
    )


# ------------------------------ Fixtures ------------------------------

@pytest.fixture
def student(client):
    return register_and_login(client, "ana@example.com")


@pytest.fixture
def other_student(client):
    return register_and_login(client, "bruno@example.com")


@pytest.fixture
def business(session):
    """Usuario negocio, creado directo en la base."""
    user = BusinessUser(
        email="negocio@example.com",
        hashed_password="hash",
        full_name="Negocio",
    )
    session.add(user)
    session.commit()
    return {"Authorization": f"Bearer {create_token(user)}"}


@pytest.fixture
def space(session):
    return make_space(session)


# ----------------------------- Modelos -----------------------------

def test_review_vote_is_unique_per_user_and_review(client, session, student, space):
    review_id = post_review(client, student, space.id).json()["id"]
    review = session.get(Review, review_id)

    session.add(ReviewVote(review_id=review.id, user_id=review.user_id, is_useful=True))
    session.commit()
    session.add(ReviewVote(review_id=review.id, user_id=review.user_id, is_useful=False))

    with pytest.raises(IntegrityError):
        session.commit()
    session.rollback()


# ------------------------- Crear reseñas -------------------------

def test_create_review(client, student, space):
    response = post_review(client, student, space.id, rating=5, comment="Excelente")

    assert response.status_code == 201
    body = response.json()
    assert body["rating"] == 5
    assert body["comment"] == "Excelente"
    assert body["space_id"] == space.id
    assert body["author_name"] == "Test User"
    assert body["images"] == []
    assert body["useful_votes"] == 0
    assert body["not_useful_votes"] == 0


def test_create_review_with_images(client, student, space):
    images = ["https://example.com/a.jpg", "https://example.com/b.jpg"]
    response = post_review(client, student, space.id, images=images)

    assert response.status_code == 201
    assert response.json()["images"] == images


def test_create_review_too_many_images(client, student, space):
    images = [f"https://example.com/{i}.jpg" for i in range(6)]
    response = post_review(client, student, space.id, images=images)

    assert response.status_code == 422


def test_create_review_requires_authentication(client, space):
    response = client.post(
        f"/reviews/space/{space.id}", json={"rating": 4, "comment": "Bien"}
    )

    assert response.status_code in (401, 403)


def test_business_cannot_create_review(client, business, space):
    response = post_review(client, business, space.id)

    assert response.status_code == 403


def test_create_review_space_not_found(client, student):
    response = post_review(client, student, 9999)

    assert response.status_code == 404


def test_create_review_twice_for_same_space_returns_409(client, student, space):
    post_review(client, student, space.id)
    response = post_review(client, student, space.id, rating=2)

    assert response.status_code == 409


@pytest.mark.parametrize("rating", [0, 6])
def test_create_review_rating_out_of_range(client, student, space, rating):
    response = post_review(client, student, space.id, rating=rating)

    assert response.status_code == 422


# ------------------------- Consultar reseñas -------------------------

def test_get_space_reviews_is_public_and_hides_hidden_reviews(
    client, session, student, other_student, space
):
    visible_id = post_review(client, student, space.id, comment="Visible").json()["id"]
    hidden_id = post_review(client, other_student, space.id, comment="Oculta").json()["id"]
    session.get(Review, hidden_id).hide()
    session.commit()

    response = client.get(f"/reviews/space/{space.id}")  # sin autenticación

    assert response.status_code == 200
    assert [review["id"] for review in response.json()] == [visible_id]


def test_get_space_reviews_space_not_found(client):
    response = client.get("/reviews/space/9999")

    assert response.status_code == 404


def test_get_my_reviews_returns_only_own_reviews(
    client, student, other_student, space
):
    own_id = post_review(client, student, space.id).json()["id"]
    post_review(client, other_student, space.id)

    response = client.get("/reviews/mine", headers=student)

    assert response.status_code == 200
    assert [review["id"] for review in response.json()] == [own_id]


# --------------------------- Editar reseñas ---------------------------

def test_update_review_changes_only_sent_fields(client, student, space):
    review_id = post_review(client, student, space.id, rating=3, comment="Normal").json()["id"]

    response = client.put(
        f"/reviews/{review_id}", json={"rating": 5}, headers=student
    )

    assert response.status_code == 200
    assert response.json()["rating"] == 5
    assert response.json()["comment"] == "Normal"


def test_update_review_with_empty_body_returns_422(client, student, space):
    review_id = post_review(client, student, space.id).json()["id"]

    response = client.put(f"/reviews/{review_id}", json={}, headers=student)

    assert response.status_code == 422


def test_update_review_of_another_user_returns_403(
    client, student, other_student, space
):
    review_id = post_review(client, student, space.id).json()["id"]

    response = client.put(
        f"/reviews/{review_id}", json={"rating": 1}, headers=other_student
    )

    assert response.status_code == 403


def test_update_review_not_found(client, student):
    response = client.put("/reviews/9999", json={"rating": 1}, headers=student)

    assert response.status_code == 404


# --------------------------- Borrar reseñas ---------------------------

def test_delete_review_also_removes_its_votes(
    client, session, student, other_student, space
):
    review_id = post_review(client, student, space.id).json()["id"]
    vote(client, other_student, review_id)

    response = client.delete(f"/reviews/{review_id}", headers=student)

    assert response.status_code == 204
    assert client.get(f"/reviews/space/{space.id}").json() == []
    assert session.query(ReviewVote).count() == 0


def test_delete_review_of_another_user_returns_403(
    client, student, other_student, space
):
    review_id = post_review(client, student, space.id).json()["id"]

    response = client.delete(f"/reviews/{review_id}", headers=other_student)

    assert response.status_code == 403


# ------------------------------- Votos -------------------------------

def test_vote_review_updates_counts(client, student, other_student, space):
    review_id = post_review(client, student, space.id).json()["id"]

    response = vote(client, other_student, review_id, is_useful=True)

    assert response.status_code == 200
    assert response.json()["useful_votes"] == 1
    assert response.json()["not_useful_votes"] == 0

    listed = client.get(f"/reviews/space/{space.id}").json()[0]
    assert listed["useful_votes"] == 1


def test_vote_again_replaces_previous_vote(client, student, other_student, space):
    review_id = post_review(client, student, space.id).json()["id"]
    vote(client, other_student, review_id, is_useful=True)

    response = vote(client, other_student, review_id, is_useful=False)

    assert response.json()["useful_votes"] == 0
    assert response.json()["not_useful_votes"] == 1


def test_cannot_vote_own_review(client, student, space):
    review_id = post_review(client, student, space.id).json()["id"]

    response = vote(client, student, review_id)

    assert response.status_code == 403


def test_cannot_vote_hidden_review(client, session, student, other_student, space):
    review_id = post_review(client, student, space.id).json()["id"]
    session.get(Review, review_id).hide()
    session.commit()

    response = vote(client, other_student, review_id)

    assert response.status_code == 404


def test_business_cannot_vote(client, student, business, space):
    review_id = post_review(client, student, space.id).json()["id"]

    response = vote(client, business, review_id)

    assert response.status_code == 403


def test_remove_vote(client, student, other_student, space):
    review_id = post_review(client, student, space.id).json()["id"]
    vote(client, other_student, review_id)

    response = client.delete(f"/reviews/{review_id}/vote", headers=other_student)

    assert response.status_code == 204
    listed = client.get(f"/reviews/space/{space.id}").json()[0]
    assert listed["useful_votes"] == 0


def test_remove_vote_when_not_voted_returns_404(client, student, other_student, space):
    review_id = post_review(client, student, space.id).json()["id"]

    response = client.delete(f"/reviews/{review_id}/vote", headers=other_student)

    assert response.status_code == 404


# ---------------------- Promedio en los espacios ----------------------

def test_spaces_list_exposes_average_rating_and_reviews_count(
    client, session, student, other_student
):
    approved = make_space(session, name="Biblioteca", approved=True)
    post_review(client, student, approved.id, rating=5)
    post_review(client, other_student, approved.id, rating=2)

    response = client.get("/spaces/")

    assert response.status_code == 200
    space_data = next(item for item in response.json() if item["id"] == approved.id)
    assert space_data["average_rating"] == 3.5
    assert space_data["reviews_count"] == 2
