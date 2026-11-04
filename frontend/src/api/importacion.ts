import type { ApiRequest } from './client'
import type { EntidadImportacion, InformeImportacion } from './types'
import { esObjeto } from './validar'

export function parseInforme(data: unknown): InformeImportacion {
  if (
    !esObjeto(data) ||
    typeof data.filas_totales !== 'number' ||
    typeof data.creadas !== 'number' ||
    typeof data.actualizadas !== 'number' ||
    !Array.isArray(data.errores)
  ) {
    throw new Error('El informe de importación no cumple el contrato.')
  }
  return data as unknown as InformeImportacion
}

/** Sube el fichero. El adaptador lo deduce el backend por la extensión. */
export async function importar(
  request: ApiRequest,
  fichero: File,
  entidad: EntidadImportacion,
): Promise<InformeImportacion> {
  const formulario = new FormData()
  formulario.set('fichero', fichero)
  formulario.set('entidad', entidad)
  return parseInforme(await request('/import', { method: 'POST', body: formulario }))
}
