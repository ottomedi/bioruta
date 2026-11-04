import type {
  ComparacionRutas,
  Coordenadas,
  CriterioRuta,
  Estado,
  Granja,
  Parada,
  RutaCalculada,
  TipoGranja,
} from '../api/types'
import { ETIQUETA_ESTADO, ETIQUETA_TIPO_GRANJA } from '../domain/riesgo'
import { distanciaKm } from '../lib/geo'

/**
 * Cálculo de rutas solo para los mocks: una aproximación para poder pintar el
 * mapa y la lista. El motor de verdad (pesos, horas de vacío, reglas duras) es
 * el del backend y sale de risk_config.json.
 */

/** De menos a más riesgo: el orden de visita de R01. */
const ORDEN_ESTADO: readonly Estado[] = [
  'sin_incidencias',
  'zona_vigilancia',
  'sospechosa',
  'positiva',
]

/** De más a menos sensible (R04). Maternidad y ciclo cerrado comparten posición. */
const POSICION_TIPO: Readonly<Record<TipoGranja, number>> = {
  nucleo_genetico: 0,
  multiplicacion: 1,
  maternidad: 2,
  ciclo_cerrado: 2,
  transicion: 3,
  cebo: 4,
}

/** Cuántas posiciones de tipo hay: sirve para combinar estado y tipo en un solo nivel. */
const POSICIONES_TIPO = Math.max(...Object.values(POSICION_TIPO)) + 1

const posicionEstado = (g: Granja) => ORDEN_ESTADO.indexOf(g.estado_actual)
/** Nivel de R08: primero el estado (R01) y, a igual estado, la sensibilidad (R04). */
const nivel = (g: Granja) => posicionEstado(g) * POSICIONES_TIPO + POSICION_TIPO[g.tipo]

/** Desde el origen, siempre a la granja pendiente más cercana. */
export function ordenMasCorta(origen: Coordenadas, granjas: readonly Granja[]): Granja[] {
  const ordenadas: Granja[] = []
  let pendientes = [...granjas]
  let punto = origen
  while (pendientes.length > 0) {
    const desde = punto
    const siguiente = pendientes.reduce((mejor, g) =>
      distanciaKm(desde, g.coordenadas) < distanciaKm(desde, mejor.coordenadas) ? g : mejor,
    )
    ordenadas.push(siguiente)
    pendientes = pendientes.filter((g) => g !== siguiente)
    punto = siguiente.coordenadas
  }
  return ordenadas
}

/**
 * Prioridades de R08: primero las sanas (R01) y, a igual estado, las más
 * sensibles (R04). Dentro de un mismo nivel, siempre a la más cercana a la
 * parada anterior: no cambia el riesgo, solo ahorra kilómetros.
 */
export function ordenSegura(origen: Coordenadas, granjas: readonly Granja[]): Granja[] {
  const niveles = [...new Set(granjas.map(nivel))].sort((a, b) => a - b)
  return niveles.reduce<{ ordenadas: Granja[]; punto: Coordenadas }>(
    ({ ordenadas, punto }, n) => {
      const tramo = ordenMasCorta(
        punto,
        granjas.filter((g) => nivel(g) === n),
      )
      return {
        ordenadas: [...ordenadas, ...tramo],
        punto: tramo.at(-1)?.coordenadas ?? punto,
      }
    },
    { ordenadas: [], punto: origen },
  ).ordenadas
}

function explicar(
  criterio: CriterioRuta,
  granja: Granja,
  orden: number,
  peorPrevio: Estado | null,
) {
  const motivo =
    criterio === 'segura'
      ? `Va en la posición ${orden}: ${ETIQUETA_ESTADO[granja.estado_actual].toLowerCase()} y ${ETIQUETA_TIPO_GRANJA[granja.tipo].toLowerCase()} (R01, R04).`
      : `Es la granja más cercana a ${orden === 1 ? 'tu base' : 'la parada anterior'}.`
  const aviso = peorPrevio
    ? ` Llegas después de pasar por una granja en estado «${ETIQUETA_ESTADO[peorPrevio].toLowerCase()}».`
    : ''
  return motivo + aviso
}

/**
 * Un tramo es peligroso si antes se ha pasado por una granja con más riesgo que
 * la de destino. `riesgo_llegada` es la posición del peor estado visitado (0 a 3).
 */
function construirRuta(
  criterio: CriterioRuta,
  base: Coordenadas,
  ordenadas: readonly Granja[],
): RutaCalculada {
  const paradas: Parada[] = ordenadas.map((granja, i) => {
    const previas = ordenadas.slice(0, i)
    const peor = previas.length > 0 ? Math.max(...previas.map(posicionEstado)) : 0
    const tramoPeligroso = peor > posicionEstado(granja)
    const { id, nombre, tipo, coordenadas, estado_actual } = granja
    return {
      id: null,
      orden: i + 1,
      granja: { id, nombre, tipo, coordenadas, estado_actual },
      riesgo_llegada: peor,
      explicacion: explicar(criterio, granja, i + 1, tramoPeligroso ? ORDEN_ESTADO[peor]! : null),
      regla_id: criterio === 'segura' ? 'R01' : null,
      tramo_peligroso: tramoPeligroso,
      visita_id: null,
    }
  })
  const geometria = [base, ...ordenadas.map((g) => g.coordenadas)]
  const km = geometria
    .slice(1)
    .reduce((total, punto, i) => total + distanciaKm(geometria[i]!, punto), 0)
  return {
    criterio,
    km_total: Math.round(km * 10) / 10,
    exposiciones: paradas.filter((p) => p.tramo_peligroso).length,
    paradas,
    geometria,
  }
}

export function calcularComparacion(
  base: Coordenadas,
  granjas: readonly Granja[],
): ComparacionRutas {
  return {
    mas_corta: construirRuta('mas_corta', base, ordenMasCorta(base, granjas)),
    segura: construirRuta('segura', base, ordenSegura(base, granjas)),
  }
}
