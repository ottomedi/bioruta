import type { ApiRequest } from './client'
import type { LoginRequest, Usuario } from './types'
import { esObjeto } from './validar'

/** Devuelve el token de una respuesta de /auth/login o /auth/demo. */
export function parseToken(data: unknown): string {
  if (!esObjeto(data) || typeof data.access_token !== 'string' || !data.access_token) {
    throw new Error('La respuesta de inicio de sesión no trae un token.')
  }
  return data.access_token
}

export function parseUsuario(data: unknown): Usuario {
  if (!esObjeto(data) || typeof data.id !== 'number' || typeof data.email !== 'string') {
    throw new Error('La respuesta de /auth/me no cumple el contrato.')
  }
  const { veterinario } = data
  if (!esObjeto(veterinario) || typeof veterinario.nombre !== 'string') {
    throw new Error('El usuario no trae su veterinario.')
  }
  return data as unknown as Usuario
}

export async function pedirTokenDemo(request: ApiRequest): Promise<string> {
  return parseToken(await request('/auth/demo', { method: 'POST' }))
}

export async function pedirToken(request: ApiRequest, credenciales: LoginRequest): Promise<string> {
  return parseToken(
    await request('/auth/login', { method: 'POST', body: JSON.stringify(credenciales) }),
  )
}

export async function pedirUsuario(request: ApiRequest, signal?: AbortSignal): Promise<Usuario> {
  return parseUsuario(await request('/auth/me', { signal }))
}
