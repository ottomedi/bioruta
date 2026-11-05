"""Datos falsos de la demo: 25 granjas, 2 veterinarios y 30 días de visitas.

    python -m app.seed                 # borra y vuelve a cargar la base de datos
    python -m app.seed --exportar DIR  # solo escribe los JSON para el MockAdapter

Las granjas 1-6, sus estados y las visitas 1-6 son las de frontend/src/mocks/fixtures.ts,
para que la demo sea la misma con mocks y con backend. El resto sale de una semilla fija.
"""

import argparse
import json
import random
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from pathlib import Path

from .enums import Enfermedad, Estado, Medida, Origen, TipoGranja
from .models import EstadoSanitario, Granja, Veterinario, Visita, VisitaMedida

SEMILLA = 42
# Fecha de referencia fija (la de las fixtures): los datos no dependen del día en que se ejecute.
ANCLA = datetime(2026, 11, 2, tzinfo=UTC)
INICIO = ANCLA - timedelta(days=30)
ESTADO_BASE_DESDE = datetime(2026, 1, 10, 8, 0, tzinfo=UTC)
GRANJA_POSITIVA = 6  # la que dispara la trazabilidad de la demo

# De más a menos riesgo
ORDEN_RIESGO = [Estado.positiva, Estado.sospechosa, Estado.zona_vigilancia, Estado.sin_incidencias]
ORDEN_MEDIDAS = list(Medida)


def _dt(texto: str) -> datetime:
    return datetime.fromisoformat(texto)


# --- Lo que viene de frontend/src/mocks/fixtures.ts -------------------------------------
# (id, nombre, tipo, latitud, longitud, codigo_rega, municipio)
GRANJAS_FIXTURES = [
    (1, "Granja El Pinar", TipoGranja.nucleo_genetico, 41.8712, 0.3104,
     "ES220000000001", "Binéfar"),
    (2, "Porcino Las Eras", TipoGranja.multiplicacion, 41.8305, 0.3421, "ES220000000002", "Esplús"),
    (3, "Explotación San Roque", TipoGranja.maternidad, 41.8941, 0.2533,
     "ES220000000003", "San Esteban de Litera"),
    (4, "Cebadero La Clamor", TipoGranja.cebo, 41.8102, 0.2789, "ES220000000004", "Altorricón"),
    (5, "Granja Valcarca", TipoGranja.transicion, 41.8623, 0.2217, None, "Tamarite de Litera"),
    (6, "Cebo Los Almendros", TipoGranja.cebo, 41.7884, 0.3307, "ES220000000006", "Albelda"),
]

# (id, granja_id, estado, enfermedad, desde, hasta)
ESTADOS_FIXTURES = [
    (1, 1, Estado.sin_incidencias, None, "2026-01-10T08:00:00Z", None),
    (2, 2, Estado.sin_incidencias, None, "2026-01-10T08:00:00Z", None),
    (3, 3, Estado.sin_incidencias, None, "2026-01-10T08:00:00Z", "2026-10-28T09:00:00Z"),
    (4, 3, Estado.zona_vigilancia, None, "2026-10-28T09:00:00Z", None),
    (5, 4, Estado.sin_incidencias, None, "2026-01-10T08:00:00Z", "2026-10-30T11:30:00Z"),
    (6, 4, Estado.sospechosa, Enfermedad.prrs, "2026-10-30T11:30:00Z", None),
    (7, 5, Estado.sin_incidencias, None, "2026-01-10T08:00:00Z", None),
    (8, 6, Estado.sin_incidencias, None, "2026-01-10T08:00:00Z", "2026-10-25T07:45:00Z"),
    (9, 6, Estado.sospechosa, Enfermedad.ppa, "2026-10-25T07:45:00Z", "2026-10-27T16:00:00Z"),
    (10, 6, Estado.positiva, Enfermedad.ppa, "2026-10-27T16:00:00Z", None),
]

# Visitas de Laura Gil (veterinario 1): (id, granja_id, entrada, salida, medidas)
VISITAS_FIXTURES = [
    (1, 2, "2026-10-22T09:00:00Z", "2026-10-22T10:05:00Z", [Medida.ducha]),
    (2, 6, "2026-10-24T12:00:00Z", "2026-10-24T13:30:00Z", []),
    (3, 1, "2026-10-26T08:00:00Z", "2026-10-26T09:10:00Z",
     [Medida.ducha, Medida.cambio_ropa, Medida.desinfeccion_calzado]),
    (4, 3, "2026-10-30T08:30:00Z", "2026-10-30T09:15:00Z", [Medida.desinfeccion_calzado]),
    (5, 4, "2026-10-31T10:00:00Z", "2026-10-31T11:20:00Z", [Medida.ducha, Medida.cambio_ropa]),
    (6, 1, "2026-11-02T08:15:00Z", "2026-11-02T09:40:00Z",
     [Medida.ducha, Medida.cambio_ropa, Medida.desinfeccion_calzado]),
]
ULTIMO_ID_VISITA_FIXTURE = 6

VETERINARIOS = [
    (1, "Laura Gil", 41.8517, 0.2946),
    (2, "Marcos Ibáñez", 41.8601, 0.2262),  # nombre inventado
]

# --- Granjas generadas ---------------------------------------------------------------------
# Centros tomados de las coordenadas de las fixtures; cada granja nueva se coloca cerca de uno.
CENTROS_LITERA = {
    "Binéfar": (41.8712, 0.3104),
    "Esplús": (41.8305, 0.3421),
    "San Esteban de Litera": (41.8941, 0.2533),
    "Altorricón": (41.8102, 0.2789),
    "Tamarite de Litera": (41.8623, 0.2217),
    "Albelda": (41.7884, 0.3307),
}
# Coordenadas tomadas del CSV de ejemplo de importación
CENTRO_SEGRIA = ("Almacelles", "Lleida", "Segrià", 41.7302, 0.6102)
MUNICIPIOS_VIGILANCIA = {"Albelda", "Esplús"}  # alrededor del foco (granja 6)
PREFIJOS = {
    TipoGranja.nucleo_genetico: "Núcleo",
    TipoGranja.multiplicacion: "Multiplicación",
    TipoGranja.maternidad: "Maternidad",
    TipoGranja.ciclo_cerrado: "Ciclo cerrado",
    TipoGranja.transicion: "Transición",
    TipoGranja.cebo: "Cebadero",
}
SUFIJOS = [
    "El Pla", "La Fuente", "Los Olivos", "San Miguel", "El Molino", "La Dehesa", "Casa Ribera",
    "Cañada Real", "Mas d'Abella", "El Cerro", "Santa Ana", "Las Torres", "La Balsa", "El Soto",
    "Los Pinos", "Valdeflores", "La Sarda", "El Regadío", "Mas Nou", "El Tozal", "La Corona",
]


@dataclass
class Escenario:
    granjas: list[Granja]
    estados: list[EstadoSanitario]
    veterinarios: list[Veterinario]
    visitas: list[Visita]
    medidas: list[VisitaMedida]


def estado_en(estados: list[EstadoSanitario], granja_id: int, momento: datetime) -> Estado:
    """Estado vigente de una granja en un instante: el de mayor riesgo entre los vigentes."""
    vigentes = {
        e.estado
        for e in estados
        if e.granja_id == granja_id
        and e.desde <= momento
        and (e.hasta is None or momento < e.hasta)
    }
    return next((s for s in ORDEN_RIESGO if s in vigentes), Estado.sin_incidencias)


def _granjas_y_estados(rng: random.Random) -> tuple[list[Granja], list[EstadoSanitario]]:
    granjas = [
        Granja(id=i, nombre=n, tipo=t, latitud=lat, longitud=lon, codigo_rega=rega,
               municipio=mun, provincia="Huesca", zona="La Litera")
        for i, n, t, lat, lon, rega, mun in GRANJAS_FIXTURES
    ]
    estados = [
        EstadoSanitario(id=i, granja_id=g, estado=e, enfermedad=enf, desde=_dt(d),
                        hasta=_dt(h) if h else None, origen=Origen.seed)
        for i, g, e, enf, d, h in ESTADOS_FIXTURES
    ]

    sufijos = rng.sample(SUFIJOS, 19)
    tipos = list(TipoGranja)
    pesos = [1, 2, 2, 2, 2, 5]
    municipios = list(CENTROS_LITERA)
    siguiente_estado = max(e.id for e in estados) + 1

    for n, gid in enumerate(range(7, 26)):
        en_segria = gid >= 24
        if en_segria:
            municipio, provincia, zona, (lat0, lon0) = (
                CENTRO_SEGRIA[0], CENTRO_SEGRIA[1], CENTRO_SEGRIA[2], CENTRO_SEGRIA[3:])
            prefijo_rega = "ES25"
        else:
            municipio = rng.choice(municipios)
            provincia, zona, (lat0, lon0) = "Huesca", "La Litera", CENTROS_LITERA[municipio]
            prefijo_rega = "ES22"
        tipo = TipoGranja.ciclo_cerrado if gid == 24 else rng.choices(tipos, weights=pesos)[0]
        granjas.append(Granja(
            id=gid, nombre=f"{PREFIJOS[tipo]} {sufijos[n]}", tipo=tipo,
            latitud=round(lat0 + rng.uniform(-0.012, 0.012), 4),
            longitud=round(lon0 + rng.uniform(-0.012, 0.012), 4),
            codigo_rega=f"{prefijo_rega}{gid:010d}", municipio=municipio,
            provincia=provincia, zona=zona))

        if municipio in MUNICIPIOS_VIGILANCIA:
            corte = _dt("2026-10-28T09:00:00Z")
            estados.append(EstadoSanitario(
                id=siguiente_estado, granja_id=gid, estado=Estado.sin_incidencias, enfermedad=None,
                desde=ESTADO_BASE_DESDE, hasta=corte, origen=Origen.seed))
            estados.append(EstadoSanitario(
                id=siguiente_estado + 1, granja_id=gid, estado=Estado.zona_vigilancia,
                enfermedad=None, desde=corte, hasta=None, origen=Origen.seed))
            siguiente_estado += 2
        else:
            estados.append(EstadoSanitario(
                id=siguiente_estado, granja_id=gid, estado=Estado.sin_incidencias, enfermedad=None,
                desde=ESTADO_BASE_DESDE, hasta=None, origen=Origen.seed))
            siguiente_estado += 1
    return granjas, estados


def _visitas(rng: random.Random, estados: list[EstadoSanitario]):
    visitas = [
        Visita(id=i, veterinario_id=1, granja_id=g, entrada=_dt(e), salida=_dt(s),
               estado_granja_en_visita=estado_en(estados, g, _dt(e)))
        for i, g, e, s, _ in VISITAS_FIXTURES
    ]
    medidas = [VisitaMedida(visita_id=i, medida=m) for i, *_, ms in VISITAS_FIXTURES for m in ms]

    # El resto de la ventana de 30 días. Dos franjas fijas por día para que nunca se solapen.
    # Nadie más visita la granja positiva: así Laura es la única expuesta y Marcos no.
    candidatas = [g for g in range(1, 26) if g != GRANJA_POSITIVA]
    nuevas: list[tuple[int, int, datetime, datetime, list[Medida]]] = []
    for vet_id in (1, 2):
        for dia in range(31):
            fecha = INICIO + timedelta(days=dia)
            if vet_id == 1 and fecha >= _dt("2026-10-22T00:00:00Z"):
                continue  # desde ahí, Laura ya tiene sus visitas de las fixtures
            if rng.random() > 0.7:
                continue
            usadas: list[int] = []
            for franja in range(rng.choice([1, 2])):
                granja = rng.choice([g for g in candidatas if g not in usadas])
                usadas.append(granja)
                entrada = fecha + timedelta(hours=8 + 3 * franja, minutes=30)
                salida = entrada + timedelta(minutes=rng.randint(45, 95))
                k = rng.choices([0, 1, 2, 3], weights=[1, 2, 3, 4])[0]
                ms = sorted(rng.sample(ORDEN_MEDIDAS, k), key=ORDEN_MEDIDAS.index)
                nuevas.append((vet_id, granja, entrada, salida, ms))

    nuevas.sort(key=lambda v: (v[2], v[0]))
    primero = ULTIMO_ID_VISITA_FIXTURE + 1
    for n, (vet_id, granja, entrada, salida, ms) in enumerate(nuevas, start=primero):
        visitas.append(Visita(
            id=n, veterinario_id=vet_id, granja_id=granja, entrada=entrada, salida=salida,
            estado_granja_en_visita=estado_en(estados, granja, entrada)))
        medidas.extend(VisitaMedida(visita_id=n, medida=m) for m in ms)
    return visitas, medidas


def construir_escenario() -> Escenario:
    """Todo el escenario en memoria. No toca la base de datos y es idéntico en cada ejecución."""
    rng = random.Random(SEMILLA)
    granjas, estados = _granjas_y_estados(rng)
    veterinarios = [Veterinario(id=i, nombre=n, base_latitud=a, base_longitud=b)
                    for i, n, a, b in VETERINARIOS]
    visitas, medidas = _visitas(rng, estados)
    return Escenario(granjas, estados, veterinarios, visitas, medidas)


# --- Base de datos ---------------------------------------------------------------------------
def _copia(fila):
    """Instancia nueva con los mismos datos, sin estado de sesión."""
    return type(fila)(**fila.model_dump())


def insertar(session, escenario: Escenario, demo_email: str, demo_password: str) -> None:
    """Borra los datos y carga el escenario. Se puede ejecutar las veces que haga falta."""
    import bcrypt
    from sqlalchemy import delete, text

    from .models import Parada, Ruta, Usuario

    # De los hijos a los padres, por las claves foráneas
    hijos_a_padres = (
        VisitaMedida, Visita, Parada, Ruta, Usuario, EstadoSanitario, Veterinario, Granja,
    )
    for modelo in hijos_a_padres:
        session.connection().execute(delete(modelo.__table__))

    # Las filas se borraron por SQL: la sesión no debe recordar las antiguas
    session.expunge_all()

    # Se insertan copias para poder cargar el mismo escenario más de una vez
    for grupo in (
        escenario.granjas,
        escenario.veterinarios,
        escenario.estados,
        escenario.visitas,
        escenario.medidas,
    ):
        session.add_all([_copia(fila) for fila in grupo])
        session.flush()
    hash_ = bcrypt.hashpw(demo_password.encode(), bcrypt.gensalt()).decode()
    session.add(Usuario(id=1, email=demo_email, password_hash=hash_, veterinario_id=1))
    session.flush()

    # En PostgreSQL, insertar ids a mano no avanza el contador: sin esto, el siguiente alta falla.
    if session.get_bind().dialect.name == "postgresql":
        for tabla in ("granja", "estado_sanitario", "veterinario", "visita", "usuario"):
            session.connection().execute(text(
                f"SELECT setval(pg_get_serial_sequence('{tabla}', 'id'), "
                f"COALESCE((SELECT MAX(id) FROM {tabla}), 1))"))
    session.commit()


def exportar_json(escenario: Escenario, carpeta: Path) -> None:
    """Escribe los JSON que lee el MockAdapter, para que nunca se desincronicen del seed."""
    carpeta.mkdir(parents=True, exist_ok=True)
    datos = {
        "granjas": escenario.granjas, "estados": escenario.estados,
        "veterinarios": escenario.veterinarios, "visitas": escenario.visitas,
        "visita_medidas": escenario.medidas,
    }
    for nombre, filas in datos.items():
        contenido = [f.model_dump(mode="json") for f in filas]
        (carpeta / f"{nombre}.json").write_text(
            json.dumps(contenido, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Carga o exporta los datos falsos de BioRuta.")
    parser.add_argument("--exportar", metavar="CARPETA", help="solo escribe los JSON de mock")
    args = parser.parse_args()
    escenario = construir_escenario()

    if args.exportar:
        exportar_json(escenario, Path(args.exportar))
        print(f"JSON escritos en {args.exportar}")
        return

    from sqlmodel import Session

    from .config import settings
    from .db import engine

    if not settings.demo_password:
        raise SystemExit("Falta DEMO_PASSWORD en el .env (mira .env.example).")
    with Session(engine) as session:
        insertar(session, escenario, settings.demo_email, settings.demo_password)
    print(f"Cargadas {len(escenario.granjas)} granjas, {len(escenario.veterinarios)} veterinarios "
          f"y {len(escenario.visitas)} visitas.")


if __name__ == "__main__":
    main()
