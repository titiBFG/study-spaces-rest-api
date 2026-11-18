import pytest

from app.models import (
    BusinessUser,
    NoiseLevel,
    Post,
    StudySpace,
)
from app.services.auth_service import create_token

# ------------------------------ Helpers ------------------------------

def make_business(session, email, name="Negocio"):
    """Usuario negocio, creado directo en la base."""
    user = BusinessUser(email=email, hashed_password="hash", full_name=name)
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
        owner_id=owner.id if owner else None,
    )
    session.add(space)
    session.commit()
    return space


def register_student(client, email="ana@example.com"):
    """Registra un estudiante y devuelve el header Authorization."""
    client.post(
        "/users/register/student",
        json={"full_name": "Test User", "email": email, "password": "password123"},
    )
    response = client.post(
        "/users/login", json={"email": email, "password": "password123"}
    )
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def create_post(client, headers, space_id, title="Nueva promo", content="2x1 en café", **extra):
    return client.post(
        f"/posts/space/{space_id}",
        json={"title": title, "content": content, **extra},
        headers=headers,
    )


# ------------------------------ Fixtures ------------------------------

@pytest.fixture
def owner(session):
    return make_business(session, "dueno@example.com", name="Café del Bosque SA")


@pytest.fixture
def other_business(session):
    return make_business(session, "otro@example.com", name="Otro Negocio")


@pytest.fixture
def space(session, owner):
    return make_space(session, owner=owner)


# ----------------------------- Modelos -----------------------------

def test_post_hide_and_restore(session, owner, space):
    post = Post(title="Promo", content="Texto", space_id=space.id, author_id=owner.id)
    session.add(post)
    session.commit()

    assert post.is_active is True
    assert post.images == []

    post.hide()
    assert post.is_active is False

    post.restore()
    assert post.is_active is True


def test_deleting_space_deletes_its_posts(session, owner, space):
    session.add(Post(title="Promo", content="Texto", space_id=space.id, author_id=owner.id))
    session.commit()

    session.delete(space)
    session.commit()

    assert session.query(Post).count() == 0


# ------------------------- Crear publicaciones -------------------------

def test_owner_can_create_post(client, owner, space):
    response = create_post(client, auth(owner), space.id, title="Promo", content="2x1")

    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Promo"
    assert body["content"] == "2x1"
    assert body["space_id"] == space.id
    assert body["author_id"] == owner.id
    assert body["author_name"] == "Café del Bosque SA"
    assert body["is_active"] is True
    assert body["images"] == []


def test_create_post_with_images(client, owner, space):
    images = ["https://example.com/a.jpg", "https://example.com/b.jpg"]
    response = create_post(client, auth(owner), space.id, images=images)

    assert response.status_code == 201
    assert response.json()["images"] == images


def test_create_post_too_many_images(client, owner, space):
    images = [f"https://example.com/{i}.jpg" for i in range(6)]
    response = create_post(client, auth(owner), space.id, images=images)

    assert response.status_code == 422


def test_create_post_requires_authentication(client, space):
    response = client.post(
        f"/posts/space/{space.id}", json={"title": "Promo", "content": "2x1"}
    )

    assert response.status_code in (401, 403)


def test_student_cannot_create_post(client, space):
    student = register_student(client)

    response = create_post(client, student, space.id)

    assert response.status_code == 403


def test_business_cannot_post_in_space_it_does_not_own(
    client, other_business, space
):
    response = create_post(client, auth(other_business), space.id)

    assert response.status_code == 403


def test_create_post_space_not_found(client, owner):
    response = create_post(client, auth(owner), 9999)

    assert response.status_code == 404


@pytest.mark.parametrize(
    "payload",
    [
        {"title": "", "content": "Texto"},
        {"title": "Promo", "content": ""},
        {"title": "x" * 161, "content": "Texto"},
        {"title": "Promo", "content": "x" * 2001},
    ],
)
def test_create_post_invalid_fields(client, owner, space, payload):
    response = client.post(f"/posts/space/{space.id}", json=payload, headers=auth(owner))

    assert response.status_code == 422


# ------------------------ Consultar publicaciones ------------------------

def test_get_space_posts_is_public_and_hides_inactive_posts(
    client, session, owner, space
):
    visible_id = create_post(client, auth(owner), space.id, title="Visible").json()["id"]
    hidden_id = create_post(client, auth(owner), space.id, title="Oculta").json()["id"]
    session.get(Post, hidden_id).hide()
    session.commit()

    response = client.get(f"/posts/space/{space.id}")  # sin autenticación

    assert response.status_code == 200
    assert [post["id"] for post in response.json()] == [visible_id]


def test_get_space_posts_returns_newest_first(client, owner, space):
    first_id = create_post(client, auth(owner), space.id, title="Primera").json()["id"]
    second_id = create_post(client, auth(owner), space.id, title="Segunda").json()["id"]

    response = client.get(f"/posts/space/{space.id}")

    assert [post["id"] for post in response.json()] == [second_id, first_id]


def test_get_space_posts_space_not_found(client):
    response = client.get("/posts/space/9999")

    assert response.status_code == 404


def test_get_my_posts_includes_hidden_and_excludes_others(
    client, session, owner, other_business, space
):
    other_space = make_space(session, owner=other_business, name="Otro espacio")
    own_id = create_post(client, auth(owner), space.id).json()["id"]
    create_post(client, auth(other_business), other_space.id)
    session.get(Post, own_id).hide()
    session.commit()

    response = client.get("/posts/mine", headers=auth(owner))

    assert response.status_code == 200
    assert [(post["id"], post["is_active"]) for post in response.json()] == [(own_id, False)]


def test_student_cannot_list_my_posts(client):
    student = register_student(client)

    response = client.get("/posts/mine", headers=student)

    assert response.status_code == 403


# ------------------------- Editar publicaciones -------------------------

def test_update_post_changes_only_sent_fields(client, owner, space):
    post_id = create_post(client, auth(owner), space.id, title="Vieja", content="Texto").json()["id"]

    response = client.put(
        f"/posts/{post_id}", json={"title": "Nueva"}, headers=auth(owner)
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Nueva"
    assert response.json()["content"] == "Texto"


def test_update_post_with_empty_body_returns_422(client, owner, space):
    post_id = create_post(client, auth(owner), space.id).json()["id"]

    response = client.put(f"/posts/{post_id}", json={}, headers=auth(owner))

    assert response.status_code == 422


def test_update_post_of_another_business_returns_403(
    client, owner, other_business, space
):
    post_id = create_post(client, auth(owner), space.id).json()["id"]

    response = client.put(
        f"/posts/{post_id}", json={"title": "Hackeado"}, headers=auth(other_business)
    )

    assert response.status_code == 403


def test_update_post_not_found(client, owner):
    response = client.put("/posts/9999", json={"title": "X"}, headers=auth(owner))

    assert response.status_code == 404


def test_student_cannot_update_post(client, owner, space):
    post_id = create_post(client, auth(owner), space.id).json()["id"]
    student = register_student(client)

    response = client.put(f"/posts/{post_id}", json={"title": "X"}, headers=student)

    assert response.status_code == 403


# ------------------------- Borrar publicaciones -------------------------

def test_delete_post(client, owner, space):
    post_id = create_post(client, auth(owner), space.id).json()["id"]

    response = client.delete(f"/posts/{post_id}", headers=auth(owner))

    assert response.status_code == 204
    assert client.get(f"/posts/space/{space.id}").json() == []


def test_delete_post_of_another_business_returns_403(
    client, owner, other_business, space
):
    post_id = create_post(client, auth(owner), space.id).json()["id"]

    response = client.delete(f"/posts/{post_id}", headers=auth(other_business))

    assert response.status_code == 403


def test_delete_post_not_found(client, owner):
    response = client.delete("/posts/9999", headers=auth(owner))

    assert response.status_code == 404
