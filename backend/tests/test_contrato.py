import json
from pathlib import Path

from app.main import app

RAIZ = Path(__file__).resolve().parents[2]
CONTRATO = json.loads((RAIZ / "docs" / "openapi.json").read_text(encoding="utf-8"))
METODOS = {"get", "post", "put", "patch", "delete"}


def operaciones(spec: dict) -> set[tuple[str, str]]:
    return {
        (metodo.upper(), ruta)
        for ruta, ops in spec["paths"].items()
        for metodo in ops
        if metodo in METODOS
    }


def test_lo_implementado_esta_en_el_contrato():
    de_mas = operaciones(app.openapi()) - operaciones(CONTRATO)
    assert not de_mas, f"Rutas que no están en el contrato: {sorted(de_mas)}"


def test_health_cumple_el_esquema_del_contrato():
    mio = app.openapi()["components"]["schemas"]["Health"]
    acordado = CONTRATO["components"]["schemas"]["Health"]
    assert set(mio["required"]) == set(acordado["required"])
    assert set(mio["properties"]) == set(acordado["properties"])
