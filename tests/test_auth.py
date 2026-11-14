import pytest

from app.models import AdminUser, BusinessUser, StudentUser, User
from app.services.auth_service import create_token

DEFAULT_USER = {
    "full_name": "Ana Test",
    "email": "ana@example.com",
    "password": "password123",
}


def register(client, kind="student", **overrides):
    """Registra un usuario (student o business). `overrides` pisa DEFAULT_USER."""
    payload = {**DEFAULT_USER, **overrides}
    return client.post(f"/users/register/{kind}", json=payload)


def login(client, email=DEFAULT_USER["email"], password=DEFAULT_USER["password"]):
    """Hace login y devuelve la respuesta completa."""
    return client.post("/users/login", json={"email": email, "password": password})


def deactivate_user(session, email=DEFAULT_USER["email"]):
    """Marca como inactivo al usuario con ese email."""
    user = session.query(User).filter(User.email == email).first()
    user.is_active = False
    session.commit()


@pytest.fixture
def auth_headers(client):
    """Registra un usuario, hace login y devuelve el header Authorization."""
    register(client)
    token = login(client).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ---------------------------- Registro ----------------------------

def test_register_success(client):
    response = register(client)

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == DEFAULT_USER["email"]
    assert body["full_name"] == DEFAULT_USER["full_name"]
    assert "id" in body
    assert "password" not in body
    assert "hashed_password" not in body


def test_register_duplicate_email_returns_400(client):
    register(client)

    response = register(client)

    assert response.status_code == 400
    assert response.json()["detail"] == "El correo ya está registrado"


def test_register_duplicate_email_is_case_insensitive(client):
    register(client, email="ana@example.com")

    response = register(client, email="ANA@Example.com")

    assert response.status_code == 400


def test_register_normalizes_email_to_lowercase(client):
    response = register(client, email="Ana@Example.com")

    assert response.status_code == 201
    assert response.json()["email"] == "ana@example.com"


def test_register_short_password_returns_422(client):
    response = register(client, password="1234567")

    assert response.status_code == 422


def test_register_too_long_password_returns_400(client):
    response = register(client, password="a" * 73)

    assert response.status_code == 400
    assert response.json()["detail"] == "La contraseña es demasiado larga"


def test_register_invalid_email_returns_422(client):
    response = register(client, email="esto-no-es-un-email")

    assert response.status_code == 422


def test_register_missing_field_returns_422(client):
    response = client.post("/users/register/student", json={"email": "ana@example.com"})

    assert response.status_code == 422


def test_register_stores_hashed_password(client, session):
    register(client)

    user = session.query(User).filter(User.email == DEFAULT_USER["email"]).first()

    assert user is not None
    assert user.hashed_password != DEFAULT_USER["password"]
    assert user.verify_password(DEFAULT_USER["password"]) is True


# ----------------------- Registro por tipo de usuario -----------------------

def test_register_student_creates_student_user(client, session):
    response = register(client, "student")

    assert response.status_code == 201
    assert response.json()["role"] == "student"
    user = session.query(User).filter(User.email == DEFAULT_USER["email"]).first()
    assert isinstance(user, StudentUser)


def test_register_business_creates_business_user(client, session):
    response = register(client, "business")

    assert response.status_code == 201
    assert response.json()["role"] == "business"
    user = session.query(User).filter(User.email == DEFAULT_USER["email"]).first()
    assert isinstance(user, BusinessUser)


def test_register_business_duplicate_email_across_types_returns_400(client):
    register(client, "student")

    response = register(client, "business")

    assert response.status_code == 400


def test_admin_cannot_be_registered_publicly(client):
    response = register(client, "admin")

    assert response.status_code in (404, 405)


def test_login_returns_role(client):
    register(client, "business")

    response = login(client)

    assert response.json()["user"]["role"] == "business"


def test_current_user_is_instance_of_its_subclass(client, session):
    admin = AdminUser(email="admin@example.com", hashed_password="x", full_name="Admin")
    session.add(admin)
    session.commit()
    headers = {"Authorization": f"Bearer {create_token(admin)}"}

    response = client.get("/users/me", headers=headers)

    assert response.status_code == 200
    assert response.json()["role"] == "admin"


# ------------------------------ Login -------------------------------

def test_login_success_returns_token(client):
    register(client)

    response = login(client)

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"]["email"] == DEFAULT_USER["email"]


def test_login_email_is_case_insensitive(client):
    register(client)

    response = login(client, email="ANA@EXAMPLE.COM")

    assert response.status_code == 200


def test_login_wrong_password_returns_401(client):
    register(client)

    response = login(client, password="otra-password")

    assert response.status_code == 401
    assert response.json()["detail"] == "Correo o contraseña incorrectos"


def test_login_unknown_email_returns_401(client):
    response = login(client, email="nadie@example.com")

    assert response.status_code == 401


def test_login_same_message_for_wrong_password_and_unknown_email(client):
    """No se debe revelar si el email existe o no."""
    register(client)

    wrong_password = login(client, password="otra-password")
    unknown_email = login(client, email="nadie@example.com")

    assert wrong_password.json()["detail"] == unknown_email.json()["detail"]


def test_login_inactive_user_returns_403(client, session):
    register(client)
    deactivate_user(session)

    response = login(client)

    assert response.status_code == 403
    assert response.json()["detail"] == "La cuenta está desactivada"


# ----------------------------- /users/me ----------------------------

def test_me_with_valid_token(client, auth_headers):
    response = client.get("/users/me", headers=auth_headers)

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == DEFAULT_USER["email"]
    assert body["full_name"] == DEFAULT_USER["full_name"]


def test_me_without_token_is_rejected(client):
    response = client.get("/users/me")

    assert response.status_code in (401, 403)


def test_me_with_invalid_token_returns_401(client):
    response = client.get("/users/me", headers={"Authorization": "Bearer cualquiercosa"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Sesión inválida o vencida"


def test_me_with_tampered_token_returns_401(client, auth_headers):
    token = auth_headers["Authorization"].split(" ")[1]
    tampered = token[:-3] + ("aaa" if not token.endswith("aaa") else "bbb")

    response = client.get("/users/me", headers={"Authorization": f"Bearer {tampered}"})

    assert response.status_code == 401


def test_me_with_token_of_deactivated_user_returns_401(client, session, auth_headers):
    deactivate_user(session)

    response = client.get("/users/me", headers=auth_headers)

    assert response.status_code == 401
    assert response.json()["detail"] == "Usuario no disponible"
