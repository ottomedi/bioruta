import { createContext, useContext } from 'react'
import type { ApiRequest } from '../api/client'
import type { LoginRequest, Usuario } from '../api/types'

export type EstadoSesion =
  | { readonly kind: 'comprobando' }
  /** `aviso`: la sesión guardada no se pudo comprobar (red, servidor dormido); el token sigue guardado. */
  | { readonly kind: 'sin_sesion'; readonly aviso?: string }
  | { readonly kind: 'con_sesion'; readonly usuario: Usuario }

export interface AuthApi {
  readonly estado: EstadoSesion
  readonly entrarComoDemo: () => Promise<void>
  readonly iniciarSesion: (credenciales: LoginRequest) => Promise<void>
  readonly cerrarSesion: () => void
  /** Cliente de la API con el token de la sesión; un 401 cierra la sesión. */
  readonly request: ApiRequest
}

export const AuthContext = createContext<AuthApi | null>(null)

/** Sesión actual y acciones para entrar y salir. Necesita un AuthProvider por encima. */
export function useAuth(): AuthApi {
  const api = useContext(AuthContext)
  if (!api) {
    throw new Error('useAuth necesita un <AuthProvider> por encima.')
  }
  return api
}
