from datetime import date, datetime

from sqlalchemy import Column, ForeignKey, Integer, UniqueConstraint
from sqlalchemy import Enum as SAEnum
from sqlmodel import Field, SQLModel

from .enums import (
    Criterio, Enfermedad, Estado, EstadoRuta, Medida, Origen, TipoGranja,
)
from .tipos import UtcDateTime


def col_enum(enum_cls, **kw):
    # VARCHAR en vez de tipo nativo: igual en SQLite y PostgreSQL, y añadir un
    # valor al enum no exige tocar un tipo de PostgreSQL.
    return Column(SAEnum(enum_cls, native_enum=False, length=30), **kw)


def col_fecha(**kw):
    return Column(UtcDateTime, **kw)


class Granja(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    codigo_rega: str | None = Field(default=None, unique=True, index=True)
    nombre: str
    tipo: TipoGranja = Field(sa_column=col_enum(TipoGranja, nullable=False))
    latitud: float
    longitud: float
    municipio: str
    provincia: str
    zona: str | None = None


class EstadoSanitario(SQLModel, table=True):
    __tablename__ = "estado_sanitario"
    id: int | None = Field(default=None, primary_key=True)
    granja_id: int = Field(foreign_key="granja.id", index=True)
    estado: Estado = Field(sa_column=col_enum(Estado, nullable=False))
    enfermedad: Enfermedad | None = Field(
        default=None, sa_column=col_enum(Enfermedad, nullable=True)
    )
    desde: datetime = Field(sa_column=col_fecha(nullable=False))
    hasta: datetime | None = Field(default=None, sa_column=col_fecha(nullable=True))
    origen: Origen = Field(sa_column=col_enum(Origen, nullable=False))


class Veterinario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str
    base_latitud: float
    base_longitud: float


class Ruta(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint("veterinario_id", "fecha", name="uq_ruta_veterinario_fecha"),
    )
    id: int | None = Field(default=None, primary_key=True)
    veterinario_id: int = Field(foreign_key="veterinario.id", index=True)
    fecha: date
    criterio: Criterio = Field(sa_column=col_enum(Criterio, nullable=False))
    km_total: float
    exposiciones: int
    estado: EstadoRuta = Field(sa_column=col_enum(EstadoRuta, nullable=False))


class Parada(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    ruta_id: int = Field(foreign_key="ruta.id", index=True)
    orden: int
    granja_id: int = Field(foreign_key="granja.id")
    riesgo_llegada: float
    explicacion: str
    regla_id: str | None = None


class Visita(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    veterinario_id: int = Field(foreign_key="veterinario.id", index=True)
    granja_id: int = Field(foreign_key="granja.id", index=True)
    entrada: datetime = Field(sa_column=col_fecha(nullable=False))
    salida: datetime | None = Field(default=None, sa_column=col_fecha(nullable=True))
    parada_id: int | None = Field(default=None, foreign_key="parada.id")
    estado_granja_en_visita: Estado = Field(sa_column=col_enum(Estado, nullable=False))


class VisitaMedida(SQLModel, table=True):
    __tablename__ = "visita_medida"
    visita_id: int = Field(
        sa_column=Column(
            Integer, ForeignKey("visita.id", ondelete="CASCADE"), primary_key=True
        )
    )
    medida: Medida = Field(sa_column=col_enum(Medida, primary_key=True))


class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    veterinario_id: int = Field(foreign_key="veterinario.id")
