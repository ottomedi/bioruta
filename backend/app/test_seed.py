from collections import Counter
from datetime import timedelta

import pytest
from sqlalchemy import event
from sqlalchemy.exc import IntegrityError
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine, select

from app.enums import Estado, Medida
from app.models import Granja, Usuario, Veterinario, Visita, VisitaMedida
from app.seed import ANCLA, INICIO, construir_escenario, estado_en, insertar


def volcar(filas):
    return [f.model_dump(mode="json") for f in filas]


def test_cifras_del_plan():
    e = construir_escenario()
    assert len(e.granjas) == 25
    assert len(e.veterinarios) == 2
    dias = {v.entrada.date() for v in e.visitas}
    assert len(dias) >= 25
    assert all(INICIO <= v.entrada <= ANCLA + timedelta(days=1) for v in e.visitas)


def test_es_reproducible():
    a, b = construir_escenario(), construir_escenario()
    for campo in ("granjas", "estados", "veterinarios", "visitas", "medidas"):
        assert volcar(getattr(a, campo)) == volcar(getattr(b, campo))


def test_las_seis_primeras_granjas_son_las_de_las_fixtures():
    g = {x.id: x for x in construir_escenario().granjas}
    assert g[1].nombre == "Granja El Pinar" and g[1].codigo_rega == "ES220000000001"
    assert g[5].codigo_rega is None
    assert (g[6].nombre, g[6].latitud, g[6].longitud) == ("Cebo Los Almendros", 41.7884, 0.3307)


def test_codigos_rega_unicos_y_sin_chocar_con_el_csv_de_ejemplo():
    reg = [g.codigo_rega for g in construir_escenario().granjas if g.codigo_rega]
    assert len(reg) == len(set(reg))
    assert not any(r.endswith(("0101", "0102", "0103", "0105")) for r in reg)


def test_estado_vigente_de_la_demo():
    e = construir_escenario()
    assert estado_en(e.estados, 6, ANCLA) == Estado.positiva
    assert estado_en(e.estados, 4, ANCLA) == Estado.sospechosa
    # el 24 de octubre (antes de la sospecha del día 25) la granja 6 aún no tenía incidencias
    assert estado_en(e.estados, 6, ANCLA - timedelta(days=9)) == Estado.sin_incidencias


def test_estado_guardado_en_la_visita_coincide_con_el_historial():
    e = construir_escenario()
    for v in e.visitas:
        assert v.estado_granja_en_visita == estado_en(e.estados, v.granja_id, v.entrada)


def test_solo_laura_visito_la_granja_positiva():
    e = construir_escenario()
    assert {v.veterinario_id for v in e.visitas if v.granja_id == 6} == {1}


def test_las_visitas_de_un_veterinario_no_se_solapan():
    e = construir_escenario()
    for vet in (1, 2):
        vs = sorted((v for v in e.visitas if v.veterinario_id == vet), key=lambda v: v.entrada)
        assert all(v.salida > v.entrada for v in vs)
        assert all(a.salida <= b.entrada for a, b in zip(vs, vs[1:], strict=False))


def test_ninguna_medida_repetida_en_una_visita():
    e = construir_escenario()
    c = Counter((m.visita_id, m.medida) for m in e.medidas)
    assert max(c.values()) == 1


# --- Con base de datos (SQLite en memoria) -------------------------------------------------
@pytest.fixture()
def session():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )

    @event.listens_for(engine, "connect")
    def _fk(dbapi_conn, _):
        cur = dbapi_conn.cursor()
        cur.execute("PRAGMA foreign_keys=ON")
        cur.close()

    SQLModel.metadata.create_all(engine)
    with Session(engine) as s:
        yield s


def contar(session, modelo):
    return len(session.exec(select(modelo)).all())


def test_insertar_carga_todo_y_se_puede_repetir(session):
    e = construir_escenario()
    insertar(session, e, "demo@bioruta.es", "clave-de-prueba")
    insertar(session, e, "demo@bioruta.es", "clave-de-prueba")  # idempotente
    assert contar(session, Granja) == 25
    assert contar(session, Veterinario) == 2
    assert contar(session, Visita) == len(e.visitas)
    assert contar(session, VisitaMedida) == len(e.medidas)
    usuario = session.exec(select(Usuario)).one()
    assert usuario.email == "demo@bioruta.es"
    assert usuario.password_hash != "clave-de-prueba"


def test_la_misma_medida_no_puede_repetirse_en_una_visita(session):
    insertar(session, construir_escenario(), "demo@bioruta.es", "x")
    session.add(VisitaMedida(visita_id=3, medida=Medida.ducha))  # la visita 3 ya la tiene
    with pytest.raises(IntegrityError):
        session.commit()
