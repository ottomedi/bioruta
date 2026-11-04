import type { ApiRequest } from './client'
import { ETIQUETA_ESTADO } from '../domain/riesgo'
import type { CalculoRutaRequest, ComparacionRutas } from './types'
import { esObjeto } from './validar'

/** El orden acaba en el HTML del marcador y el estado decide su color: los dos se comprueban. */
function esParada(data: unknown): boolean {
  if (!esObjeto(data) || !Number.isInteger(data.orden) || !esObjeto(data.granja)) return false
  const { estado_actual } = data.granja
  return typeof estado_actual === 'string' && estado_actual in ETIQUETA_ESTADO
}

function esRuta(data: unknown): boolean {
  return (
    esObjeto(data) &&
    typeof data.km_total === 'number' &&
    typeof data.exposiciones === 'number' &&
    Array.isArray(data.paradas) &&
    data.paradas.every(esParada) &&
    Array.isArray(data.geometria)
  )
}

export function parseComparacion(data: unknown): ComparacionRutas {
  if (!esObjeto(data) || !esRuta(data.mas_corta) || !esRuta(data.segura)) {
    throw new Error('La respuesta del cálculo de rutas no cumple el contrato.')
  }
  return data as unknown as ComparacionRutas
}

/** Calcula la ruta más corta y la segura. No guarda nada. */
export async function calcularRutas(
  request: ApiRequest,
  peticion: CalculoRutaRequest,
): Promise<ComparacionRutas> {
  const data = await request('/rutas/calcular', {
    method: 'POST',
    body: JSON.stringify(peticion),
  })
  return parseComparacion(data)
}
