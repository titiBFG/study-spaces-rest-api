from http import HTTPStatus


def test_health_check_returns_ok(client):
    response = client.get("/health")

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {"status": "ok"}


def test_openapi_document_is_available(client):
    response = client.get("/openapi.json")

    assert response.status_code == HTTPStatus.OK
    assert response.json()["info"]["title"] == "Study Spaces API"
