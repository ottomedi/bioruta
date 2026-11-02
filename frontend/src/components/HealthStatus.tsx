import { CircleAlert, CircleCheck, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchHealth, type Health } from '../api/health'

type HealthState =
  | { readonly kind: 'cargando' }
  | { readonly kind: 'ok'; readonly health: Health }
  | { readonly kind: 'error'; readonly message: string }

interface HealthStatusProps {
  /** Se puede sustituir en los tests. */
  readonly load?: (signal: AbortSignal) => Promise<Health>
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Error desconocido.'
}

/** Indicador del estado del backend. El color siempre va con icono y texto. */
export function HealthStatus({ load = fetchHealth }: HealthStatusProps) {
  const [state, setState] = useState<HealthState>({ kind: 'cargando' })

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
      .then((health) => {
        // Si el efecto ya se limpió, esta respuesta es de una petición vieja.
        if (controller.signal.aborted) return
        setState({ kind: 'ok', health })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({ kind: 'error', message: errorMessage(error) })
      })
    return () => controller.abort()
  }, [load])

  if (state.kind === 'cargando') {
    return (
      <p role="status" className="flex items-center gap-1.5 text-sm text-slate-600">
        <LoaderCircle aria-hidden className="size-4 animate-spin" />
        Conectando con el servidor… (puede tardar hasta 1 min)
      </p>
    )
  }

  if (state.kind === 'error') {
    return (
      <p
        role="status"
        className="flex items-center gap-1.5 text-sm text-red-700"
        title={state.message}
      >
        <CircleAlert aria-hidden className="size-4" />
        Servidor no disponible
      </p>
    )
  }

  return (
    <p role="status" className="flex items-center gap-1.5 text-sm text-green-700">
      <CircleCheck aria-hidden className="size-4" />
      Servidor en línea (v{state.health.version})
    </p>
  )
}
