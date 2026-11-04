import type { ApiRequest } from './client'
import type { Visita } from './types'
import { aQuery, parsePagina, type Pagina } from './validar'

export interface FiltrosVisitas {
  readonly page?: number
  readonly limit?: number
  readonly granja_id?: number
}

/** Visitas de la más reciente a la más antigua (lo ordena el backend). */
export async function listarVisitas(
  request: ApiRequest,
  filtros: FiltrosVisitas,
  signal?: AbortSignal,
): Promise<Pagina<Visita>> {
  const data = await request(`/visitas${aQuery({ ...filtros })}`, { signal })
  return parsePagina<Visita>(data, '/visitas')
}
