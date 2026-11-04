from enum import StrEnum


class TipoGranja(StrEnum):
    nucleo_genetico = "nucleo_genetico"
    multiplicacion = "multiplicacion"
    maternidad = "maternidad"
    ciclo_cerrado = "ciclo_cerrado"
    transicion = "transicion"
    cebo = "cebo"


class Estado(StrEnum):
    positiva = "positiva"
    sospechosa = "sospechosa"
    zona_vigilancia = "zona_vigilancia"
    sin_incidencias = "sin_incidencias"


class Enfermedad(StrEnum):
    ppa = "ppa"
    prrs = "prrs"
    otra = "otra"


class Origen(StrEnum):
    importado = "importado"
    alerta = "alerta"
    seed = "seed"


class Medida(StrEnum):
    ducha = "ducha"
    cambio_ropa = "cambio_ropa"
    desinfeccion_calzado = "desinfeccion_calzado"


class Criterio(StrEnum):
    mas_corta = "mas_corta"
    segura = "segura"


class EstadoRuta(StrEnum):
    planificada = "planificada"
    en_curso = "en_curso"
    cerrada = "cerrada"
    afectada_por_alerta = "afectada_por_alerta"
