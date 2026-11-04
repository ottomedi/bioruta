import type { ApiRequest } from './client'
import type { Estado, EstadoSanitario, Granja, TipoGranja } from './types'
import { aQuery, esObjeto, parseLista, parsePagina, type Pagina } from './validar'

/** Filtros de GET /granjas. Los vacíos no se mandan. */
export interface FiltrosGranjas {
  readonly page?: number
  readonly limit?: number
  readonly tipo?: TipoGranja
  readonly estado?: Estado
  readonly zona?: string
  readonly q?: string
}

export function parseGranja(data: unknown): Granja {
  if (
    !esObjeto(data) ||
    typeof data.id !== 'number' ||
    typeof data.nombre !== 'string' ||
    typeof data.estado_actual !== 'string'
  ) {
    throw new Error('La granja recibida no cumple el contrato.')
  }
  return data as unknown as Granja
}

export async function listarGranjas(
  request: ApiRequest,
  filtros: FiltrosGranjas,
  signal?: AbortSignal,
): Promise<Pagina<Granja>> {
  const data = await request(`/granjas${aQuery({ ...filtros })}`, { signal })
  return parsePagina<Granja>(data, '/granjas')
}

export async function obtenerGranja(
  request: ApiRequest,
  id: number,
  signal?: AbortSignal,
): Promise<Granja> {
  return parseGranja(await request(`/granjas/${id}`, { signal }))
}

/** Historial sanitario, del más reciente al más antiguo (lo ordena el backend). */
export async function listarEstados(
  request: ApiRequest,
  id: number,
  signal?: AbortSignal,
): Promise<EstadoSanitario[]> {
  return parseLista<EstadoSanitario>(await request(`/granjas/${id}/estados`, { signal }), 'estados')
}

export async function listarZonas(request: ApiRequest, signal?: AbortSignal): Promise<string[]> {
  return parseLista<string>(await request('/zonas', { signal }), '/zonas')
}
