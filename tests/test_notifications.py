import pytest

from app.models import (
    AdminUser,
    BusinessUser,
    InAppNotification,
    NoiseLevel,
    Notification,
    NotificationChannel,
    NotificationEventType,
    NotificationPreference,
    Post,
    Review,
    StudentUser,
    StudySpace,
)
from app.services.auth_service import create_token
from app.services.notification_service import (
    ActivityNotificationService,
    PromotionNotificationService,
)

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


def make_review(session, author, space):
    review = Review(rating=4, comment="Muy bueno", user_id=author.id, space_id=space.id)
    session.add(review)
    session.commit()
    return review


def make_post(session, author, space, title="Promo"):
    post = Post(title=title, content="Texto", author_id=author.id, space_id=space.id)
    session.add(post)
    session.commit()
    return post


def add_favorite(client, user, space):
    return client.post("/favorites", json={"space_id": space.id}, headers=auth(user))


def inbox(client, user, **params):
    """Bandeja de notificaciones del usuario, como la devuelve la API."""
    response = client.get("/notifications", params=params, headers=auth(user))
    assert response.status_code == 200
    return response.json()


def notify(session, student, message="Aviso"):
    """Crea una notificación in-app para un estudiante, usando el servicio."""
    return PromotionNotificationService(session).send_notifications(
        student, NotificationEventType.NEW_POST, message
    )[0]


# ------------------------------ Fixtures ------------------------------

@pytest.fixture
def student(session):
    return make_user(session, StudentUser, "ana@example.com", "Ana")


@pytest.fixture
def other_student(session):
    return make_user(session, StudentUser, "bruno@example.com", "Bruno")


@pytest.fixture
def third_student(session):
    return make_user(session, StudentUser, "carla@example.com", "Carla")


@pytest.fixture
def business(session):
    return make_user(session, BusinessUser, "dueno@example.com", "Café del Bosque SA")


@pytest.fixture
def admin(session):
    return make_user(session, AdminUser, "admin@example.com", "Admin")


@pytest.fixture
def space(session, business):
    return make_space(session, owner=business)


# ----------------------- Modelos y servicio base -----------------------

def test_notification_is_abstract():
    with pytest.raises(TypeError):
        Notification(message="x")


def test_in_app_notification_send_and_mark_as_read(session, student):
    notification = InAppNotification(
        user_id=student.id,
        event_type=NotificationEventType.NEW_POST,
        message="Hola",
    )
    session.add(notification)
    session.commit()

    assert notification.sent_at is None
    assert notification.is_read is False

    notification.send()
    notification.mark_as_read()
    first_read_at = notification.read_at
    notification.mark_as_read()

    assert notification.sent_at is not None
    assert notification.is_read is True
    assert notification.read_at == first_read_at


def test_service_creates_and_stores_an_in_app_notification(session, student):
    created = PromotionNotificationService(session).send_notifications(
        student, NotificationEventType.NEW_POST, "Nueva promo"
    )

    assert len(created) == 1
    assert isinstance(created[0], InAppNotification)
    assert created[0].channel == NotificationChannel.IN_APP
    assert created[0].sent_at is not None
    assert session.query(Notification).count() == 1


def test_service_rejects_an_event_it_does_not_handle(session, student):
    service = PromotionNotificationService(session)

    with pytest.raises(ValueError):
        service.send_notifications(student, NotificationEventType.REPORT_OUTCOME, "x")


def test_service_respects_a_disabled_preference(session, student):
    session.add(
        NotificationPreference(
            user_id=student.id,
            event_type=NotificationEventType.NEW_POST,
            channel=NotificationChannel.IN_APP,
            is_enabled=False,
        )
    )
    session.commit()

    created = PromotionNotificationService(session).send_notifications(
        student, NotificationEventType.NEW_POST, "Nueva promo"
    )

    assert created == []
    assert session.query(Notification).count() == 0


def test_service_does_not_notify_blocked_users(session, student):
    student.is_active = False
    session.commit()

    created = PromotionNotificationService(session).send_notifications(
        student, NotificationEventType.NEW_POST, "Nueva promo"
    )

    assert created == []


# --------------------------- Observer: espacios ---------------------------

def test_space_observers_are_the_students_with_it_in_favorites(
    client, student, other_student, third_student, space
):
    add_favorite(client, student, space)
    custom_list = client.post(
        "/lists", json={"name": "Para estudiar"}, headers=auth(other_student)
    ).json()
    client.post(
        f"/lists/{custom_list['id']}/spaces",
        json={"space_id": space.id},
        headers=auth(other_student),
    )

    assert [observer.id for observer in space.observers] == [student.id]


def test_new_post_notifies_only_the_students_with_the_space_in_favorites(
    client, student, other_student, third_student, business, space
):
    add_favorite(client, student, space)
    custom_list = client.post(
        "/lists", json={"name": "Para estudiar"}, headers=auth(other_student)
    ).json()
    client.post(
        f"/lists/{custom_list['id']}/spaces",
        json={"space_id": space.id},
        headers=auth(other_student),
    )

    response = client.post(
        f"/posts/space/{space.id}",
        json={"title": "2x1 en café", "content": "Hasta el viernes"},
        headers=auth(business),
    )

    assert response.status_code == 201
    notifications = inbox(client, student)
    assert len(notifications) == 1
    assert notifications[0]["event_type"] == "new_post"
    assert notifications[0]["channel"] == "in_app"
    assert "2x1 en café" in notifications[0]["message"]
    assert notifications[0]["is_read"] is False
    assert inbox(client, other_student) == []
    assert inbox(client, third_student) == []


def test_new_post_respects_the_disabled_preference(client, student, business, space):
    add_favorite(client, student, space)
    client.put(
        "/notifications/preferences",
        json={"event_type": "new_post", "is_enabled": False},
        headers=auth(student),
    )

    client.post(
        f"/posts/space/{space.id}",
        json={"title": "Promo", "content": "Texto"},
        headers=auth(business),
    )

    assert inbox(client, student) == []


def test_approving_an_edited_space_notifies_observers_once(
    client, session, student, admin, space
):
    add_favorite(client, student, space)
    space.is_approved = False  # el negocio editó el espacio y quedó pendiente
    session.commit()

    client.patch(f"/spaces/{space.id}/approve", headers=auth(admin))
    client.patch(f"/spaces/{space.id}/approve", headers=auth(admin))

    notifications = inbox(client, student)
    assert [item["event_type"] for item in notifications] == ["space_updated"]
    assert space.name in notifications[0]["message"]


def test_approving_a_space_without_observers_works(client, session, admin, business, space):
    space.is_approved = False
    session.commit()

    response = client.patch(f"/spaces/{space.id}/approve", headers=auth(admin))

    assert response.status_code == 200
    notifications = inbox(client, business)
    assert len(notifications) == 1
    assert notifications[0]["event_type"] == "space_approved"
    assert space.name in notifications[0]["message"]
    assert session.query(Notification).count() == 1


# ---------------------------- Reportes ----------------------------

def report(client, reporter, path):
    return client.post(
        f"/reports/{path}", json={"reason": "Contenido ofensivo"}, headers=auth(reporter)
    ).json()["id"]


def test_resolving_a_review_report_notifies_reporter_and_author(
    client, session, student, other_student, admin, space
):
    review = make_review(session, student, space)
    report_id = report(client, other_student, f"reviews/{review.id}")

    client.put(f"/reports/{report_id}/resolve", headers=auth(admin))

    reporter_inbox = inbox(client, other_student)
    author_inbox = inbox(client, student)
    assert [item["event_type"] for item in reporter_inbox] == ["report_outcome"]
    assert [item["event_type"] for item in author_inbox] == ["content_moderated"]
    assert space.name in author_inbox[0]["message"]


def test_dismissing_a_report_notifies_only_the_reporter(
    client, session, student, other_student, admin, space
):
    review = make_review(session, student, space)
    report_id = report(client, other_student, f"reviews/{review.id}")

    client.put(f"/reports/{report_id}/dismiss", headers=auth(admin))

    reporter_inbox = inbox(client, other_student)
    assert [item["event_type"] for item in reporter_inbox] == ["report_outcome"]
    assert "no encontramos una infracción" in reporter_inbox[0]["message"]
    assert inbox(client, student) == []


def test_resolving_a_post_report_notifies_reporter_and_post_author(
    client, session, student, business, admin, space
):
    post = make_post(session, business, space, title="Promo falsa")
    report_id = report(client, student, f"posts/{post.id}")

    client.put(f"/reports/{report_id}/resolve", headers=auth(admin))

    assert [item["event_type"] for item in inbox(client, student)] == ["report_outcome"]
    business_inbox = inbox(client, business)
    assert [item["event_type"] for item in business_inbox] == ["content_moderated"]
    assert "Promo falsa" in business_inbox[0]["message"]


def test_resolving_a_user_report_notifies_only_the_reporter(
    client, student, other_student, admin
):
    report_id = report(client, other_student, f"users/{student.id}")

    client.put(f"/reports/{report_id}/resolve", headers=auth(admin))

    assert [item["event_type"] for item in inbox(client, other_student)] == [
        "report_outcome"
    ]
    # El usuario reportado quedó bloqueado: no recibe nada y no puede entrar.
    assert client.get("/notifications", headers=auth(student)).status_code == 401


# ------------------------- Actividad sobre reseñas -------------------------

def test_new_review_notifies_the_space_owner(client, student, business, space):
    response = client.post(
        f"/reviews/space/{space.id}",
        json={"rating": 5, "comment": "Excelente"},
        headers=auth(student),
    )

    assert response.status_code == 201
    notifications = inbox(client, business)
    assert [item["event_type"] for item in notifications] == ["new_review"]
    assert "Ana" in notifications[0]["message"]
    assert "5" in notifications[0]["message"]


def test_new_review_on_a_space_without_owner_works(client, session, student):
    ownerless = make_space(session, owner=None, name="Biblioteca")

    response = client.post(
        f"/reviews/space/{ownerless.id}",
        json={"rating": 3, "comment": "Normal"},
        headers=auth(student),
    )

    assert response.status_code == 201
    assert session.query(Notification).count() == 0


def test_voting_a_review_notifies_the_author_only_when_the_vote_changes(
    client, session, student, other_student, space
):
    review = make_review(session, student, space)

    def vote(is_useful):
        return client.put(
            f"/reviews/{review.id}/vote",
            json={"is_useful": is_useful},
            headers=auth(other_student),
        )

    vote(True)
    vote(True)  # mismo voto: no hay novedad
    assert len(inbox(client, student)) == 1

    vote(False)  # cambió el voto
    notifications = inbox(client, student)
    assert len(notifications) == 2
    assert {item["event_type"] for item in notifications} == {"review_voted"}
    assert "no útil" in notifications[0]["message"]


def test_activity_service_ignores_a_review_without_owner(session, student):
    ownerless = make_space(session, owner=None, name="Biblioteca")
    review = make_review(session, student, ownerless)

    ActivityNotificationService(session).notify_new_review(review)

    assert session.query(Notification).count() == 0


# ------------------------------ Bandeja ------------------------------

def test_inbox_lists_only_own_notifications_newest_first(
    client, session, student, other_student
):
    first = notify(session, student, "Primera")
    second = notify(session, student, "Segunda")
    notify(session, other_student, "De otra persona")

    response = inbox(client, student)

    assert [item["id"] for item in response] == [second.id, first.id]


def test_inbox_unread_filter_and_counter(client, session, student):
    read = notify(session, student, "Leída")
    unread = notify(session, student, "Sin leer")
    client.put(f"/notifications/{read.id}/read", headers=auth(student))

    only_unread = inbox(client, student, unread_only=True)
    counter = client.get("/notifications/unread-count", headers=auth(student))

    assert [item["id"] for item in only_unread] == [unread.id]
    assert counter.json() == {"unread": 1}


def test_mark_as_read(client, session, student):
    notification = notify(session, student)

    response = client.put(f"/notifications/{notification.id}/read", headers=auth(student))

    assert response.status_code == 200
    assert response.json()["is_read"] is True
    assert response.json()["read_at"] is not None


def test_cannot_mark_another_users_notification_as_read(
    client, session, student, other_student
):
    notification = notify(session, student)

    response = client.put(
        f"/notifications/{notification.id}/read", headers=auth(other_student)
    )

    assert response.status_code == 403


def test_mark_as_read_not_found(client, student):
    response = client.put("/notifications/9999/read", headers=auth(student))

    assert response.status_code == 404


def test_mark_all_as_read(client, session, student, other_student):
    notify(session, student)
    notify(session, student)
    notify(session, other_student)

    response = client.put("/notifications/read-all", headers=auth(student))

    assert response.status_code == 204
    assert client.get("/notifications/unread-count", headers=auth(student)).json() == {
        "unread": 0
    }
    # No toca las de otra persona
    assert client.get(
        "/notifications/unread-count", headers=auth(other_student)
    ).json() == {"unread": 1}


@pytest.mark.parametrize(
    ("method", "path"),
    [
        ("get", "/notifications"),
        ("get", "/notifications/unread-count"),
        ("get", "/notifications/preferences"),
        ("put", "/notifications/read-all"),
    ],
)
def test_notifications_require_authentication(client, method, path):
    response = getattr(client, method)(path)

    assert response.status_code in (401, 403)


# ---------------------------- Preferencias ----------------------------

def test_preferences_depend_on_the_role_and_default_to_enabled(
    client, student, business, admin
):
    student_prefs = client.get("/notifications/preferences", headers=auth(student)).json()
    business_prefs = client.get("/notifications/preferences", headers=auth(business)).json()
    admin_prefs = client.get("/notifications/preferences", headers=auth(admin)).json()

    assert {item["event_type"] for item in student_prefs} == {
        "new_post",
        "space_updated",
        "review_voted",
        "content_moderated",
        "report_outcome",
    }
    assert {item["event_type"] for item in business_prefs} == {
        "new_review",
        "content_moderated",
        "report_outcome",
    }
    assert admin_prefs == []
    assert all(item["is_enabled"] and item["channel"] == "in_app" for item in student_prefs)


def test_disable_and_reenable_a_preference(client, student):
    disable = client.put(
        "/notifications/preferences",
        json={"event_type": "review_voted", "channel": "in_app", "is_enabled": False},
        headers=auth(student),
    )
    after_disable = client.get("/notifications/preferences", headers=auth(student)).json()
    client.put(
        "/notifications/preferences",
        json={"event_type": "review_voted", "is_enabled": True},
        headers=auth(student),
    )
    after_enable = client.get("/notifications/preferences", headers=auth(student)).json()

    def enabled(prefs):
        return next(p["is_enabled"] for p in prefs if p["event_type"] == "review_voted")

    assert disable.status_code == 200
    assert disable.json() == {
        "event_type": "review_voted",
        "channel": "in_app",
        "is_enabled": False,
    }
    assert enabled(after_disable) is False
    assert enabled(after_enable) is True


def test_cannot_set_a_preference_for_an_event_of_another_role(client, student):
    response = client.put(
        "/notifications/preferences",
        json={"event_type": "new_review", "is_enabled": False},
        headers=auth(student),
    )

    assert response.status_code == 400


def test_set_preference_with_unknown_event_returns_422(client, student):
    response = client.put(
        "/notifications/preferences",
        json={"event_type": "inventado", "is_enabled": False},
        headers=auth(student),
    )

    assert response.status_code == 422
