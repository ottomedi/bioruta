import type { Granja } from '../api/types'
import { GRANJAS } from './fixtures'
import type { GranjaNueva } from './importarCsv'

/**
 * Granjas de los mocks: las de los fixtures más las importadas. Vive en memoria,
 * así que al recargar la página se vuelve a los fixtures.
 */
let granjas: readonly Granja[] = GRANJAS

export function granjasGuardadas(): readonly Granja[] {
  return granjas
}

export interface CambiosGuardado {
  readonly creadas: number
  readonly actualizadas: number
}

/** Una granja con un código REGA que ya existe la sustituye en vez de duplicarla. */
export function guardarGranjas(nuevas: readonly GranjaNueva[]): CambiosGuardado {
  let creadas = 0
  let actualizadas = 0
  granjas = nuevas.reduce<readonly Granja[]>((lista, nueva) => {
    const existente = nueva.codigo_rega
      ? lista.find((g) => g.codigo_rega === nueva.codigo_rega)
      : undefined
    if (existente) {
      actualizadas += 1
      return lista.map((g) => (g === existente ? { ...nueva, id: existente.id } : g))
    }
    creadas += 1
    const id = Math.max(0, ...lista.map((g) => g.id)) + 1
    return [...lista, { ...nueva, id }]
  }, granjas)
  return { creadas, actualizadas }
}

/** Para los tests: cada uno empieza con los fixtures. */
export function reiniciarAlmacen(): void {
  granjas = GRANJAS
}
