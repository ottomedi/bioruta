import { useCallback, useEffect, useState } from 'react'
import { mensajeDeError } from './errores'

export type EstadoCarga<T> =
  /** `previos`: los datos de la carga anterior, para no vaciar la pantalla mientras llega la nueva. */
  | { readonly kind: 'cargando'; readonly previos?: T }
  | { readonly kind: 'ok'; readonly datos: T }
  /** `error` es el original, por si la pantalla necesita distinguir (un 404, por ejemplo). */
  | { readonly kind: 'error'; readonly mensaje: string; readonly error: unknown }

type Cargar<T> = (signal: AbortSignal) => Promise<T>

interface Resultado<T> {
  readonly de: Cargar<T>
  readonly intento: number
  readonly estado: EstadoCarga<T>
}

/**
 * Carga datos al montar y cada vez que cambia `cargar`, que debe venir de un
 * useCallback con sus dependencias. Cancela la petición anterior, así una
 * respuesta lenta de unos filtros viejos no pisa la de los nuevos.
 */
export function useCarga<T>(cargar: Cargar<T>): readonly [EstadoCarga<T>, () => void] {
  const [intento, setIntento] = useState(0)
  const [resultado, setResultado] = useState<Resultado<T> | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const guardar = (estado: EstadoCarga<T>) => {
      // Si el efecto ya se limpió, la respuesta es de una petición vieja.
      if (!controller.signal.aborted) setResultado({ de: cargar, intento, estado })
    }
    cargar(controller.signal)
      .then((datos) => guardar({ kind: 'ok', datos }))
      .catch((error: unknown) => guardar({ kind: 'error', mensaje: mensajeDeError(error), error }))
    return () => controller.abort()
  }, [cargar, intento])

  const reintentar = useCallback(() => setIntento((n) => n + 1), [])
  // El resultado guardado solo vale para la carga y el intento actuales; si no, se está cargando.
  if (resultado?.de === cargar && resultado.intento === intento) {
    return [resultado.estado, reintentar]
  }
  const previos = resultado?.estado.kind === 'ok' ? resultado.estado.datos : undefined
  return [previos === undefined ? { kind: 'cargando' } : { kind: 'cargando', previos }, reintentar]
}
