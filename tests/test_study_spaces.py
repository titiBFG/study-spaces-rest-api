
from app.models import NoiseLevel, StudySpace


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
