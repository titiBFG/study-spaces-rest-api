import pytest

from app.models import (
    FavoritesList,
    ListItem,
    NoiseLevel,
    StudySpace,
    StudySpacesList,
    User,
    UserRole,
)
from app.services.auth_service import create_token

# ------------------------------ Helpers ------------------------------

def register_and_login(client, email):
    """Registra un estudiante y devuelve el header Authorization."""
    client.post(
        "/users/register",
        json={"full_name": "Test User", "email": email, "password": "password123"},
    )
    response = client.post(
        "/users/login", json={"email": email, "password": "password123"}
    )
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def make_space(session, name="Café del Bosque"):
    space = StudySpace(
        name=name,
        description="Café con enchufes",
        address="Av. Siempre Viva 742",
        city="San Martín",
        latitude=-34.58,
        longitude=-58.54,
        noise_level=NoiseLevel.MEDIUM,
    )
    session.add(space)
    session.commit()
    return space


def create_list(client, headers, name="Parciales"):
    return client.post("/lists", json={"name": name}, headers=headers)


def add_to_list(client, headers, list_id, space_id):
    return client.post(
        f"/lists/{list_id}/spaces", json={"space_id": space_id}, headers=headers
    )


def get_favorites_list_id(client, headers):
    lists = client.get("/lists", headers=headers).json()
    return next(item["id"] for item in lists if item["list_type"] == "favorites")


# ------------------------------ Fixtures ------------------------------

@pytest.fixture
def student(client):
    return register_and_login(client, "ana@example.com")


@pytest.fixture
def other_student(client):
    return register_and_login(client, "bruno@example.com")


@pytest.fixture
def business(session):
    """Usuario con rol negocio (el registro solo crea estudiantes por ahora)."""
    user = User(
        email="negocio@example.com",
        hashed_password="hash",
        full_name="Negocio",
        role=UserRole.BUSINESS,
    )
    session.add(user)
    session.commit()
    return {"Authorization": f"Bearer {create_token(user)}"}


@pytest.fixture
def space(session):
    return make_space(session)


# ----------------------------- Modelos -----------------------------

def test_list_type_is_set_by_class(session):
    user = User(
        email="m@example.com", hashed_password="hash",
        full_name="M", role=UserRole.STUDENT,
    )
    session.add(user)
    session.commit()

    custom = StudySpacesList(name="Mi lista", user_id=user.id)
    favorites = FavoritesList(name="Favoritos", user_id=user.id)
    session.add_all([custom, favorites])
    session.commit()

    assert custom.list_type == "custom"
    assert favorites.list_type == "favorites"
    assert isinstance(
        session.get(StudySpacesList, favorites.id), FavoritesList
    )


# --------------------------- Crear listas ---------------------------

def test_create_list_success(client, student):
    response = create_list(client, student, "Parciales")

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Parciales"
    assert body["list_type"] == "custom"
    assert "id" in body and "user_id" in body and "created_at" in body


def test_create_list_empty_name_returns_422(client, student):
    response = create_list(client, student, "")

    assert response.status_code == 422


def test_create_list_without_token_is_rejected(client):
    response = client.post("/lists", json={"name": "Parciales"})

    assert response.status_code in (401, 403)


def test_create_list_as_business_returns_403(client, business):
    response = create_list(client, business)

    assert response.status_code == 403


# --------------------------- Consultar listas ---------------------------

def test_get_my_lists_returns_only_own_lists(client, student, other_student):
    create_list(client, student, "De Ana")
    create_list(client, other_student, "De Bruno")

    response = client.get("/lists", headers=student)

    assert response.status_code == 200
    assert [item["name"] for item in response.json()] == ["De Ana"]


def test_get_list_success(client, student):
    list_id = create_list(client, student).json()["id"]

    response = client.get(f"/lists/{list_id}", headers=student)

    assert response.status_code == 200
    assert response.json()["id"] == list_id


def test_get_list_not_found_returns_404(client, student):
    response = client.get("/lists/9999", headers=student)

    assert response.status_code == 404


def test_get_list_of_other_user_returns_403(client, student, other_student):
    list_id = create_list(client, student).json()["id"]

    response = client.get(f"/lists/{list_id}", headers=other_student)

    assert response.status_code == 403


# --------------------------- Renombrar y borrar ---------------------------

def test_rename_list_success(client, student):
    list_id = create_list(client, student, "Parciales").json()["id"]

    response = client.patch(
        f"/lists/{list_id}", json={"name": "Finales"}, headers=student
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Finales"


def test_rename_list_of_other_user_returns_403(client, student, other_student):
    list_id = create_list(client, student).json()["id"]

    response = client.patch(
        f"/lists/{list_id}", json={"name": "Hackeada"}, headers=other_student
    )

    assert response.status_code == 403


def test_delete_list_success(client, student):
    list_id = create_list(client, student).json()["id"]

    response = client.delete(f"/lists/{list_id}", headers=student)

    assert response.status_code == 204
    assert client.get(f"/lists/{list_id}", headers=student).status_code == 404


def test_delete_list_of_other_user_returns_403(client, student, other_student):
    list_id = create_list(client, student).json()["id"]

    response = client.delete(f"/lists/{list_id}", headers=other_student)

    assert response.status_code == 403


def test_delete_list_also_deletes_its_items(client, session, student, space):
    list_id = create_list(client, student).json()["id"]
    add_to_list(client, student, list_id, space.id)

    client.delete(f"/lists/{list_id}", headers=student)

    assert session.query(ListItem).filter(ListItem.list_id == list_id).count() == 0


# ------------------------ Espacios en una lista ------------------------

def test_add_space_to_list_success(client, student, space):
    list_id = create_list(client, student).json()["id"]

    response = add_to_list(client, student, list_id, space.id)

    assert response.status_code == 201
    assert response.json()["list_id"] == list_id
    assert response.json()["space_id"] == space.id


def test_add_duplicate_space_returns_409(client, student, space):
    list_id = create_list(client, student).json()["id"]
    add_to_list(client, student, list_id, space.id)

    response = add_to_list(client, student, list_id, space.id)

    assert response.status_code == 409


def test_add_nonexistent_space_returns_404(client, student):
    list_id = create_list(client, student).json()["id"]

    response = add_to_list(client, student, list_id, 9999)

    assert response.status_code == 404


def test_add_space_to_nonexistent_list_returns_404(client, student, space):
    response = add_to_list(client, student, 9999, space.id)

    assert response.status_code == 404


def test_add_space_to_list_of_other_user_returns_403(
    client, student, other_student, space
):
    list_id = create_list(client, student).json()["id"]

    response = add_to_list(client, other_student, list_id, space.id)

    assert response.status_code == 403


def test_same_space_can_be_in_different_lists(client, student, space):
    first = create_list(client, student, "Primera").json()["id"]
    second = create_list(client, student, "Segunda").json()["id"]

    assert add_to_list(client, student, first, space.id).status_code == 201
    assert add_to_list(client, student, second, space.id).status_code == 201


def test_get_list_spaces_returns_saved_spaces(client, session, student, space):
    other_space = make_space(session, "Biblioteca")
    list_id = create_list(client, student).json()["id"]
    add_to_list(client, student, list_id, space.id)
    add_to_list(client, student, list_id, other_space.id)

    response = client.get(f"/lists/{list_id}/spaces", headers=student)

    assert response.status_code == 200
    assert {item["name"] for item in response.json()} == {"Café del Bosque", "Biblioteca"}


def test_remove_space_from_list_success(client, student, space):
    list_id = create_list(client, student).json()["id"]
    add_to_list(client, student, list_id, space.id)

    response = client.delete(f"/lists/{list_id}/spaces/{space.id}", headers=student)

    assert response.status_code == 204
    assert client.get(f"/lists/{list_id}/spaces", headers=student).json() == []


def test_remove_space_not_in_list_returns_404(client, student, space):
    list_id = create_list(client, student).json()["id"]

    response = client.delete(f"/lists/{list_id}/spaces/{space.id}", headers=student)

    assert response.status_code == 404


# ------------------------------ Favoritos ------------------------------

def test_add_favorite_success(client, student, space):
    response = client.post("/favorites", json={"space_id": space.id}, headers=student)

    assert response.status_code == 201
    assert response.json()["space_id"] == space.id


def test_get_favorites_returns_saved_spaces(client, student, space):
    client.post("/favorites", json={"space_id": space.id}, headers=student)

    response = client.get("/favorites", headers=student)

    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == [space.id]


def test_get_favorites_empty_for_new_student(client, student):
    response = client.get("/favorites", headers=student)

    assert response.status_code == 200
    assert response.json() == []


def test_add_duplicate_favorite_returns_409(client, student, space):
    client.post("/favorites", json={"space_id": space.id}, headers=student)

    response = client.post("/favorites", json={"space_id": space.id}, headers=student)

    assert response.status_code == 409


def test_add_nonexistent_space_to_favorites_returns_404(client, student):
    response = client.post("/favorites", json={"space_id": 9999}, headers=student)

    assert response.status_code == 404


def test_student_has_only_one_favorites_list(client, session, student):
    first = make_space(session, "Uno")
    second = make_space(session, "Dos")
    client.post("/favorites", json={"space_id": first.id}, headers=student)
    client.post("/favorites", json={"space_id": second.id}, headers=student)

    lists = client.get("/lists", headers=student).json()

    assert [item["list_type"] for item in lists].count("favorites") == 1


def test_remove_favorite_success(client, student, space):
    client.post("/favorites", json={"space_id": space.id}, headers=student)

    response = client.delete(f"/favorites/{space.id}", headers=student)

    assert response.status_code == 204
    assert client.get("/favorites", headers=student).json() == []


def test_remove_space_not_in_favorites_returns_404(client, student, space):
    response = client.delete(f"/favorites/{space.id}", headers=student)

    assert response.status_code == 404


def test_favorites_are_private_per_user(client, student, other_student, space):
    client.post("/favorites", json={"space_id": space.id}, headers=student)

    response = client.get("/favorites", headers=other_student)

    assert response.json() == []


def test_favorites_list_cannot_be_renamed(client, student, space):
    client.post("/favorites", json={"space_id": space.id}, headers=student)
    favorites_id = get_favorites_list_id(client, student)

    response = client.patch(
        f"/lists/{favorites_id}", json={"name": "Otro nombre"}, headers=student
    )

    assert response.status_code == 400


def test_favorites_list_cannot_be_deleted(client, student, space):
    client.post("/favorites", json={"space_id": space.id}, headers=student)
    favorites_id = get_favorites_list_id(client, student)

    response = client.delete(f"/lists/{favorites_id}", headers=student)

    assert response.status_code == 400


def test_business_cannot_use_favorites(client, business, space):
    response = client.post("/favorites", json={"space_id": space.id}, headers=business)

    assert response.status_code == 403