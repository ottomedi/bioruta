import { ETIQUETA_TIPO_REGLA } from '../domain/etiquetas'
import type { ApiRequest } from './client'
import type { Regla } from './types'
import { esObjeto, parseLista } from './validar'

function esRegla(data: unknown): boolean {
  return (
    esObjeto(data) &&
    typeof data.id === 'string' &&
    typeof data.descripcion === 'string' &&
    typeof data.tipo === 'string' &&
    // Un tipo desconocido no tendría etiqueta ni estilo y rompería la pantalla.
    data.tipo in ETIQUETA_TIPO_REGLA
  )
}

export async function listarReglas(request: ApiRequest, signal?: AbortSignal): Promise<Regla[]> {
  const reglas = parseLista<Regla>(await request('/reglas', { signal }), '/reglas')
  if (!reglas.every(esRegla)) throw new Error('La hoja de reglas no cumple el contrato.')
  return reglas
}

/** Solo enlaces http(s): una URL «javascript:» que llegara del backend no se puede pulsar. */
export function enlaceSeguro(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const { protocol } = new URL(url)
    return protocol === 'https:' || protocol === 'http:' ? url : null
  } catch {
    return null
  }
}
