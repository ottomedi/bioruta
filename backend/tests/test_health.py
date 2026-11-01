from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"estado": "ok", "version": "0.1.0"}


def test_error_404_usa_el_formato_del_contrato():
    r = client.get("/ruta-que-no-existe")
    assert r.status_code == 404
    cuerpo = r.json()
    assert set(cuerpo) == {"codigo", "mensaje", "detalles", "regla_id"}
    assert cuerpo["codigo"] == "no_encontrado"
