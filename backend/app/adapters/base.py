from typing import Protocol

from ..models import EstadoSanitario, Granja, Veterinario, Visita, VisitaMedida


class DataAdapter(Protocol):
    """Cualquier fuente de datos (mock, datos oficiales del evento...) devuelve el modelo interno.

    El motor, la API y la interfaz solo conocen estos tipos: para meter datos nuevos se escribe
    un adaptador nuevo y no se toca nada más.
    """

    def granjas(self) -> list[Granja]: ...

    def estados(self) -> list[EstadoSanitario]: ...

    def veterinarios(self) -> list[Veterinario]: ...

    def visitas(self) -> list[Visita]: ...

    def visita_medidas(self) -> list[VisitaMedida]: ...
