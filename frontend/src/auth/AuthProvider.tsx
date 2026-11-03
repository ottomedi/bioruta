import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { pedirToken, pedirTokenDemo, pedirUsuario } from '../api/auth'
import { ApiRequestError, createApiClient, type ApiRequest } from '../api/client'
import type { LoginRequest } from '../api/types'
import { AuthContext, type AuthApi, type EstadoSesion } from './authContext'
import { borrarToken, guardarToken, leerToken } from './session'

interface AuthProviderProps {
  readonly children: ReactNode
  /** Se puede sustituir en los tests. */
  readonly baseUrl?: string
}

const HTTP_UNAUTHORIZED = 401

function avisoDeComprobacion(error: unknown): string {
  const detalle = error instanceof Error ? ` ${error.message}` : ''
  return `No se ha podido comprobar la sesión guardada.${detalle}`
}

/**
 * Guarda la sesión. Al arrancar, si hay un token guardado, pregunta a /auth/me
 * quién es. Solo un 401 lo borra: si el backend no responde (Render en frío),
 * el token se conserva y el login avisa del problema.
 */
export function AuthProvider({ children, baseUrl }: AuthProviderProps) {
  const [tokenInicial] = useState(leerToken)
  const [estado, setEstado] = useState<EstadoSesion>(
    tokenInicial ? { kind: 'comprobando' } : { kind: 'sin_sesion' },
  )
  // Token vigente y comprobación inicial en curso. Solo se leen en callbacks y efectos.
  const tokenRef = useRef(tokenInicial)
  const comprobacionRef = useRef<AbortController | null>(null)

  const cerrarSesion = useCallback(() => {
    comprobacionRef.current?.abort()
    tokenRef.current = null
    borrarToken()
    setEstado({ kind: 'sin_sesion' })
  }, [])

  /** Cliente atado a un token. Su 401 solo cierra la sesión si ese token sigue siendo el vigente. */
  const clienteCon = useCallback(
    (conToken: string | null) =>
      createApiClient({
        baseUrl,
        getToken: () => conToken,
        onUnauthorized: () => {
          if (conToken !== null && conToken === tokenRef.current) cerrarSesion()
        },
      }),
    [baseUrl, cerrarSesion],
  )

  const request = useCallback<ApiRequest>(
    (path, init) => clienteCon(tokenRef.current)(path, init),
    [clienteCon],
  )

  useEffect(() => {
    if (!tokenInicial) return
    const controller = new AbortController()
    comprobacionRef.current = controller
    pedirUsuario(clienteCon(tokenInicial), controller.signal)
      .then((usuario) => {
        if (!controller.signal.aborted) setEstado({ kind: 'con_sesion', usuario })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        // El 401 ya cerró la sesión desde el cliente; el resto deja el token para reintentar.
        if (error instanceof ApiRequestError && error.status === HTTP_UNAUTHORIZED) return
        setEstado({ kind: 'sin_sesion', aviso: avisoDeComprobacion(error) })
      })
    return () => controller.abort()
  }, [tokenInicial, clienteCon])

  const abrirSesion = useCallback(
    async (pedirNuevoToken: (sinSesion: ApiRequest) => Promise<string>) => {
      // Entrar gana a la comprobación inicial: su respuesta ya no debe tocar el estado.
      comprobacionRef.current?.abort()
      try {
        const nuevo = await pedirNuevoToken(clienteCon(null))
        const usuario = await pedirUsuario(clienteCon(nuevo))
        tokenRef.current = nuevo
        guardarToken(nuevo)
        setEstado({ kind: 'con_sesion', usuario })
      } catch (error: unknown) {
        setEstado((actual) => (actual.kind === 'comprobando' ? { kind: 'sin_sesion' } : actual))
        throw error
      }
    },
    [clienteCon],
  )

  const value = useMemo<AuthApi>(
    () => ({
      estado,
      entrarComoDemo: () => abrirSesion(pedirTokenDemo),
      iniciarSesion: (credenciales: LoginRequest) =>
        abrirSesion((sinSesion) => pedirToken(sinSesion, credenciales)),
      cerrarSesion,
      request,
    }),
    [estado, abrirSesion, cerrarSesion, request],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
