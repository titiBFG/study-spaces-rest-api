from app.models import (
    AdminUser,
    BusinessUser,
    NoiseLevel,
    Notification,
    NotificationEventType,
    StudySpace,
)
from app.services.auth_service import create_token


def auth(user):
    return {"Authorization": f"Bearer {create_token(user)}"}


def crear_usuario(session, clase, email):
    usuario = clase(email=email, hashed_password="hash", full_name="Usuario")
    session.add(usuario)
    session.commit()
    return usuario


def datos_espacio(nombre="Espacio Nuevo"):
    return {
        "name": nombre,
        "description": "Lugar tranquilo para estudiar",
        "address": "Calle 123",
        "city": "San Martin",
        "latitude": -34.57,
        "longitude": -58.53,
        "has_wifi": True,
        "has_outlets": True,
        "noise_level": "low",
        "opening_hours": "9 a 18",
        "image_url": None,
    }


def test_get_spaces_with_filters(client, session):
    space1 = StudySpace(
        name="Biblioteca Central",
        description="Lugar tranquilo",
        address="Calle 123",
        city="San Martin",
        latitude=-34.57,
        longitude=-58.53,
        has_wifi=True,
        has_outlets=True,
        noise_level=NoiseLevel.LOW,
        is_approved=True,
    )

    space2 = StudySpace(
        name="Cafe del Centro",
        description="Lugar para estudiar",
        address="Calle 456",
        city="San Martin",
        latitude=-34.58,
        longitude=-58.54,
        has_wifi=False,
        has_outlets=False,
        noise_level=NoiseLevel.HIGH,
        is_approved=True,
    )

    session.add_all([space1, space2])
    session.commit()

    response = client.get("/spaces/")
    assert response.status_code == 200
    assert len(response.json()) == 2

    response = client.get("/spaces/?name=Biblioteca")
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Biblioteca Central"

    response = client.get("/spaces/?has_wifi=true")
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Biblioteca Central"

    response = client.get("/spaces/?has_outlets=true")
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Biblioteca Central"

    response = client.get("/spaces/?noise_level=low")
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Biblioteca Central"


def test_pending_space_not_visible(client, session):
    espacio = StudySpace(
        name="Espacio Pendiente",
        description="Todavia no aprobado",
        address="Calle 789",
        city="San Martin",
        latitude=-34.57,
        longitude=-58.53,
        has_wifi=True,
        has_outlets=True,
        noise_level=NoiseLevel.LOW,
        is_approved=False,
    )

    session.add(espacio)
    session.commit()

    response = client.get("/spaces/")

    assert response.status_code == 200
    assert len(response.json()) == 0


def test_crear_espacio_notifica_a_los_administradores(client, session):
    negocio = crear_usuario(session, BusinessUser, "negocio1@example.com")
    admin1 = crear_usuario(session, AdminUser, "admin1@example.com")
    admin2 = crear_usuario(session, AdminUser, "admin2@example.com")

    response = client.post("/spaces/", json=datos_espacio(), headers=auth(negocio))

    assert response.status_code == 201
    assert response.json()["is_approved"] is False
    assert response.json()["is_rejected"] is False

    notificaciones = session.query(Notification).all()
    assert len(notificaciones) == 2
    assert {n.user_id for n in notificaciones} == {admin1.id, admin2.id}
    assert all(n.event_type == NotificationEventType.SPACE_PENDING for n in notificaciones)


def test_aprobar_espacio_notifica_al_negocio(client, session):
    negocio = crear_usuario(session, BusinessUser, "negocio2@example.com")
    admin = crear_usuario(session, AdminUser, "admin3@example.com")
    creado = client.post("/spaces/", json=datos_espacio(), headers=auth(negocio))
    assert creado.status_code == 201
    espacio_id = creado.json()["id"]

    response = client.patch(f"/spaces/{espacio_id}/approve", headers=auth(admin))

    assert response.status_code == 200
    assert response.json()["is_approved"] is True
    assert response.json()["is_rejected"] is False
    assert any(
        n.event_type == NotificationEventType.SPACE_APPROVED
        for n in session.query(Notification).filter_by(user_id=negocio.id).all()
    )
    assert any(e["id"] == espacio_id for e in client.get("/spaces/").json())


def test_rechazar_espacio_notifica_y_lo_quita_de_pendientes(client, session):
    negocio = crear_usuario(session, BusinessUser, "negocio3@example.com")
    admin = crear_usuario(session, AdminUser, "admin4@example.com")
    creado = client.post("/spaces/", json=datos_espacio(), headers=auth(negocio))
    assert creado.status_code == 201
    espacio_id = creado.json()["id"]

    response = client.patch(f"/spaces/{espacio_id}/reject", headers=auth(admin))

    assert response.status_code == 200
    assert response.json()["is_approved"] is False
    assert response.json()["is_rejected"] is True
    assert client.get("/spaces/pending", headers=auth(admin)).json() == []
    assert client.get("/spaces/").json() == []
    assert any(
        n.event_type == NotificationEventType.SPACE_REJECTED
        for n in session.query(Notification).filter_by(user_id=negocio.id).all()
    )


def test_editar_rechazado_vuelve_a_pendiente(client, session):
    negocio = crear_usuario(session, BusinessUser, "negocio4@example.com")
    admin = crear_usuario(session, AdminUser, "admin5@example.com")
    creado = client.post("/spaces/", json=datos_espacio(), headers=auth(negocio))
    assert creado.status_code == 201
    espacio_id = creado.json()["id"]
    rechazado = client.patch(f"/spaces/{espacio_id}/reject", headers=auth(admin))
    assert rechazado.status_code == 200

    response = client.put(
        f"/spaces/{espacio_id}",
        json=datos_espacio("Espacio Corregido"),
        headers=auth(negocio),
    )

    assert response.status_code == 200
    assert response.json()["is_approved"] is False
    assert response.json()["is_rejected"] is False
    pendientes = client.get("/spaces/pending", headers=auth(admin)).json()
    assert len(pendientes) == 1
    assert pendientes[0]["name"] == "Espacio Corregido"
    avisos_admin = session.query(Notification).filter_by(user_id=admin.id).all()
    assert sum(n.event_type == NotificationEventType.SPACE_PENDING for n in avisos_admin) == 2


def test_solo_admin_puede_aprobar_o_rechazar(client, session):
    negocio = crear_usuario(session, BusinessUser, "negocio5@example.com")
    creado = client.post("/spaces/", json=datos_espacio(), headers=auth(negocio))
    assert creado.status_code == 201
    espacio_id = creado.json()["id"]

    assert client.patch(f"/spaces/{espacio_id}/approve", headers=auth(negocio)).status_code == 403
    assert client.patch(f"/spaces/{espacio_id}/reject", headers=auth(negocio)).status_code == 403
