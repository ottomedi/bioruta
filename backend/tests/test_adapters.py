import json

import pytest

from app.adapters.mock import CARPETA_POR_DEFECTO, MockAdapter
from app.seed import construir_escenario, exportar_json


def volcar(filas):
    return [f.model_dump(mode="json") for f in filas]


def test_el_adaptador_devuelve_lo_que_exporta_el_seed(tmp_path):
    escenario = construir_escenario()
    exportar_json(escenario, tmp_path)
    adaptador = MockAdapter(tmp_path)
    assert volcar(adaptador.granjas()) == volcar(escenario.granjas)
    assert volcar(adaptador.estados()) == volcar(escenario.estados)
    assert volcar(adaptador.veterinarios()) == volcar(escenario.veterinarios)
    assert volcar(adaptador.visitas()) == volcar(escenario.visitas)
    assert volcar(adaptador.visita_medidas()) == volcar(escenario.medidas)


def test_una_fila_invalida_dice_en_que_archivo_y_fila(tmp_path):
    exportar_json(construir_escenario(), tmp_path)
    ruta = tmp_path / "granjas.json"
    filas = json.loads(ruta.read_text(encoding="utf-8"))
    filas[0]["tipo"] = "tipo_inventado"
    ruta.write_text(json.dumps(filas), encoding="utf-8")
    with pytest.raises(ValueError, match=r"granjas\.json, fila 0"):
        MockAdapter(tmp_path).granjas()


def test_los_json_versionados_estan_al_dia(tmp_path):
    exportar_json(construir_escenario(), tmp_path)
    for archivo in tmp_path.glob("*.json"):
        versionado = CARPETA_POR_DEFECTO / archivo.name
        assert versionado.read_text(encoding="utf-8") == archivo.read_text(encoding="utf-8"), (
            f"{archivo.name} está desactualizado: ejecuta python -m app.seed --exportar data/mock"
        )
