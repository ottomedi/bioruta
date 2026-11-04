/** Comprobaciones mínimas de las respuestas: lo justo para no pintar basura si el backend cambia. */

export function esObjeto(data: unknown): data is Record<string, unknown> {
  return typeof data === 'object' && data !== null
}

/** Una lista del contrato (`items`, `total`, `page`, `limit`). */
export interface Pagina<T> {
  readonly items: readonly T[]
  readonly total: number
  readonly page: number
  readonly limit: number
}

/** `recurso` sale en el mensaje de error, para saber qué endpoint falló. */
export function parseLista<T>(data: unknown, recurso: string): T[] {
  if (!Array.isArray(data)) {
    throw new Error(`La respuesta de ${recurso} no es una lista.`)
  }
  return data as T[]
}

export function parsePagina<T>(data: unknown, recurso: string): Pagina<T> {
  if (
    !esObjeto(data) ||
    !Array.isArray(data.items) ||
    typeof data.total !== 'number' ||
    typeof data.page !== 'number' ||
    typeof data.limit !== 'number'
  ) {
    throw new Error(`La respuesta de ${recurso} no es una página del contrato.`)
  }
  return data as unknown as Pagina<T>
}

/** Monta `?a=1&b=2` sin los valores vacíos. Devuelve '' si no queda ninguno. */
export function aQuery(
  params: Readonly<Record<string, string | number | boolean | undefined>>,
): string {
  const search = new URLSearchParams()
  for (const [clave, valor] of Object.entries(params)) {
    if (valor !== undefined && valor !== '') search.set(clave, String(valor))
  }
  const texto = search.toString()
  return texto ? `?${texto}` : ''
}
