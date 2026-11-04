const DEV_API_URL = 'http://localhost:8000'

/**
 * Decide la URL del backend. En desarrollo, si no hay VITE_API_URL, usa el
 * backend local. En producción no hay valor por defecto: una URL vacía haría
 * que la app llamara a su propio dominio y fallara sin decir por qué.
 */
export function resolveApiUrl(raw: string | undefined, isProd: boolean): string {
  const value = raw?.trim()
  if (!value) {
    if (isProd) {
      throw new Error('Falta VITE_API_URL: la build de producción no sabe dónde está el backend.')
    }
    return DEV_API_URL
  }
  return value.replace(/\/+$/, '')
}

/** Solo «true» activa una opción, para que un valor mal escrito no la active por error. */
export function parseFlag(raw: string | undefined): boolean {
  return raw?.trim().toLowerCase() === 'true'
}

export const API_URL = resolveApiUrl(import.meta.env.VITE_API_URL, import.meta.env.PROD)

/** Con VITE_USE_MOCKS=true la app responde con los datos de src/mocks sin backend. */
export const USE_MOCKS = parseFlag(import.meta.env.VITE_USE_MOCKS)
