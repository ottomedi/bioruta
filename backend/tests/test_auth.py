import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app.config import settings
from app.db import get_session
from app.main import app
from app.seed import construir_escenario, insertar
from app.seguridad import crear_token

CLAVE = "clave-de-prueba"


@pytest.fixture()
def client():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as s:
        insertar(s, construir_escenario(), "demo@bioruta.es", CLAVE)

    def sesion_de_prueba():
        with Session(engine) as s:
            yield s

    app.dependency_overrides[get_session] = sesion_de_prueba
    yield TestClient(app)
    app.dependency_overrides.clear()


def cabecera(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_login_correcto_devuelve_un_token(client):
    r = client.post("/auth/login", json={"email": "demo@bioruta.es", "password": CLAVE})
    assert r.status_code == 200
    assert r.json()["token_type"] == "bearer"
    assert r.json()["access_token"]


def test_login_con_contrasena_erronea(client):
    r = client.post("/auth/login", json={"email": "demo@bioruta.es", "password": "mal"})
    assert r.status_code == 401
    assert r.json()["codigo"] == "no_autorizado"


def test_login_con_email_desconocido_da_el_mismo_error(client):
    r = client.post("/auth/login", json={"email": "otro@bioruta.es", "password": CLAVE})
    assert r.status_code == 401
    assert r.json()["mensaje"] == "Email o contraseña incorrectos."


def test_login_con_datos_invalidos_da_422_con_el_formato_del_contrato(client):
    r = client.post("/auth/login", json={"email": "no-es-un-email", "password": ""})
    assert r.status_code == 422
    cuerpo = r.json()
    assert cuerpo["codigo"] == "validacion"
    assert {d["campo"] for d in cuerpo["detalles"]} >= {"email", "password"}


def test_me_con_token_devuelve_el_usuario_y_su_veterinario(client):
    token = client.post("/auth/demo").json()["access_token"]
    r = client.get("/auth/me", headers=cabecera(token))
    assert r.status_code == 200
    cuerpo = r.json()
    assert cuerpo["email"] == "demo@bioruta.es"
    assert cuerpo["veterinario"]["nombre"] == "Laura Gil"
    assert cuerpo["veterinario"]["base"] == {"latitud": 41.8517, "longitud": 0.2946}


def test_me_sin_token_es_401(client):
    r = client.get("/auth/me")
    assert r.status_code == 401
    assert r.json()["codigo"] == "no_autorizado"


def test_me_con_token_caducado_es_401(client):
    r = client.get("/auth/me", headers=cabecera(crear_token(1, minutos=-1)))
    assert r.status_code == 401
    assert "caducado" in r.json()["mensaje"]


def test_me_con_token_firmado_con_otra_clave_es_401(client):
    falso = jwt.encode({"sub": "1", "exp": 4102444800}, "otra-clave", algorithm="HS256")
    r = client.get("/auth/me", headers=cabecera(falso))
    assert r.status_code == 401


def test_me_con_token_de_un_usuario_que_ya_no_existe_es_401(client):
    r = client.get("/auth/me", headers=cabecera(crear_token(999)))
    assert r.status_code == 401


def test_demo_funciona_sin_contrasena(client):
    r = client.post("/auth/demo")
    assert r.status_code == 200
    assert r.json()["token_type"] == "bearer"


def test_demo_desactivado_da_403(client, monkeypatch):
    monkeypatch.setattr(settings, "demo_habilitado", False)
    r = client.post("/auth/demo")
    assert r.status_code == 403
    assert r.json()["codigo"] == "demo_desactivado"
