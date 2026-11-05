import json
from pathlib import Path

from pydantic import ValidationError

from ..models import EstadoSanitario, Granja, Veterinario, Visita, VisitaMedida

# backend/data/mock, junto al código para que entre en la imagen de Docker
CARPETA_POR_DEFECTO = Path(__file__).resolve().parents[2] / "data" / "mock"


class MockAdapter:
    """Lee los JSON que escribe `python -m app.seed --exportar` y los valida con Pydantic."""

    def __init__(self, carpeta: Path | None = None) -> None:
        self.carpeta = carpeta or CARPETA_POR_DEFECTO

    def _leer(self, nombre: str, modelo):
        ruta = self.carpeta / f"{nombre}.json"
        filas = json.loads(ruta.read_text(encoding="utf-8"))
        resultado = []
        for n, fila in enumerate(filas):
            try:
                resultado.append(modelo.model_validate(fila))
            except ValidationError as error:
                raise ValueError(f"{ruta.name}, fila {n}: {error}") from error
        return resultado

    def granjas(self) -> list[Granja]:
        return self._leer("granjas", Granja)

    def estados(self) -> list[EstadoSanitario]:
        return self._leer("estados", EstadoSanitario)

    def veterinarios(self) -> list[Veterinario]:
        return self._leer("veterinarios", Veterinario)

    def visitas(self) -> list[Visita]:
        return self._leer("visitas", Visita)

    def visita_medidas(self) -> list[VisitaMedida]:
        return self._leer("visita_medidas", VisitaMedida)
