import { API_URL } from '../config'

/** Respuesta de GET /health según docs/openapi.json. */
export interface Health {
  readonly estado: 'ok'
  readonly version: string
}

/** El plan gratuito de Render puede tardar cerca de un minuto en despertar. */
export const HEALTH_TIMEOUT_MS = 60_000

export function parseHealth(data: unknown): Health {
  if (typeof data !== 'object' || data === null) {
    throw new Error('El backend no ha devuelto un objeto JSON.')
  }
  const { estado, version } = data as Record<string, unknown>
  if (estado !== 'ok' || typeof version !== 'string') {
    throw new Error('La respuesta de /health no cumple el contrato.')
  }
  return { estado, version }
}

export async function fetchHealth(
  signal?: AbortSignal,
  baseUrl: string = API_URL,
): Promise<Health> {
  const timeout = AbortSignal.timeout(HEALTH_TIMEOUT_MS)
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout
  const response = await fetch(`${baseUrl}/health`, { signal: combined })
  if (!response.ok) {
    throw new Error(`El backend ha respondido con el código ${response.status}.`)
  }
  return parseHealth(await response.json())
}
