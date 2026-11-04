import { API_URL } from '../config'

/** Error de la API con el formato del contrato (`codigo` y `mensaje`) o de red (`status` 0). */
export class ApiRequestError extends Error {
  readonly status: number
  readonly codigo: string

  constructor(status: number, codigo: string, mensaje: string) {
    super(mensaje)
    this.name = 'ApiRequestError'
    this.status = status
    this.codigo = codigo
  }
}

/** Hace una petición a la API y devuelve el JSON sin validar: cada llamada lo valida. */
export type ApiRequest = (path: string, init?: RequestInit) => Promise<unknown>

interface ApiClientOptions {
  readonly baseUrl?: string
  /** Se lee en cada petición, así el cliente no guarda una copia vieja del token. */
  readonly getToken: () => string | null
  /** Se llama cuando el backend rechaza un token que sí se mandó: sesión caducada o inválida. */
  readonly onUnauthorized: () => void
}

const HTTP_UNAUTHORIZED = 401

function aError(status: number, data: unknown): ApiRequestError {
  const { codigo, mensaje } = (data ?? {}) as Record<string, unknown>
  if (typeof codigo === 'string' && typeof mensaje === 'string') {
    return new ApiRequestError(status, codigo, mensaje)
  }
  return new ApiRequestError(status, 'error', `El servidor ha respondido con el código ${status}.`)
}

async function enviar(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch (error: unknown) {
    // La cancelación no es un fallo: quien canceló sabe qué hacer con ella.
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiRequestError(0, 'sin_conexion', 'No se ha podido conectar con el servidor.')
  }
}

export function createApiClient({
  baseUrl = API_URL,
  getToken,
  onUnauthorized,
}: ApiClientOptions): ApiRequest {
  return async (path, init = {}) => {
    const token = getToken()
    const headers = new Headers(init.headers)
    if (token) headers.set('Authorization', `Bearer ${token}`)
    if (init.body !== undefined && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    const response = await enviar(`${baseUrl}${path}`, { ...init, headers })
    const data: unknown = await response.json().catch(() => null)
    if (response.ok) return data

    if (response.status === HTTP_UNAUTHORIZED && token) onUnauthorized()
    throw aError(response.status, data)
  }
}
