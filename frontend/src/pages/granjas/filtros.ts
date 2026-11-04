import type { FiltrosGranjas } from '../../api/granjas'
import type { Estado, TipoGranja } from '../../api/types'
import { ETIQUETA_ESTADO, ETIQUETA_TIPO_GRANJA } from '../../domain/riesgo'

/** Granjas por página en la lista. */
export const GRANJAS_POR_PAGINA = 25

/** Claves de los filtros en la URL; así un filtro se puede compartir o volver atrás. */
export const CLAVES_FILTRO = ['q', 'tipo', 'estado', 'zona'] as const
export type ClaveFiltro = (typeof CLAVES_FILTRO)[number]

function esTipo(valor: string | null): valor is TipoGranja {
  return valor !== null && valor in ETIQUETA_TIPO_GRANJA
}

function esEstado(valor: string | null): valor is Estado {
  return valor !== null && valor in ETIQUETA_ESTADO
}

function pagina(raw: string | null): number {
  const n = Number(raw)
  return Number.isInteger(n) && n >= 1 ? n : 1
}

/** Lee los filtros de la URL. Un valor que no existe en el contrato se ignora. */
export function leerFiltros(params: URLSearchParams): FiltrosGranjas {
  const tipo = params.get('tipo')
  const estado = params.get('estado')
  return {
    page: pagina(params.get('page')),
    limit: GRANJAS_POR_PAGINA,
    q: params.get('q')?.trim() || undefined,
    tipo: esTipo(tipo) ? tipo : undefined,
    estado: esEstado(estado) ? estado : undefined,
    zona: params.get('zona') || undefined,
  }
}

/** Cambia un filtro y vuelve a la primera página, que es la única que seguro existe. */
export function conFiltro(
  params: URLSearchParams,
  clave: ClaveFiltro,
  valor: string,
): URLSearchParams {
  const nuevos = new URLSearchParams(params)
  if (valor) nuevos.set(clave, valor)
  else nuevos.delete(clave)
  nuevos.delete('page')
  return nuevos
}

export function conPagina(params: URLSearchParams, page: number): URLSearchParams {
  const nuevos = new URLSearchParams(params)
  if (page > 1) nuevos.set('page', String(page))
  else nuevos.delete('page')
  return nuevos
}

export function hayFiltros(params: URLSearchParams): boolean {
  return CLAVES_FILTRO.some((clave) => params.get(clave))
}
