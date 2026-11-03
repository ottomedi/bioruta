import { describe, expect, it } from 'vitest'
import { USUARIO_DEMO } from '../mocks/fixtures'
import { parseToken, parseUsuario } from './auth'

describe('validación de las respuestas de /auth', () => {
  it('saca el token de la respuesta', () => {
    expect(parseToken({ access_token: 'abc', token_type: 'bearer' })).toBe('abc')
  })

  it.each([null, {}, { access_token: '' }, { access_token: 3 }])(
    'rechaza una respuesta sin token: %j',
    (data) => {
      expect(() => parseToken(data)).toThrow('no trae un token')
    },
  )

  it('acepta el usuario del contrato', () => {
    expect(parseUsuario(USUARIO_DEMO)).toEqual(USUARIO_DEMO)
  })

  it('rechaza un usuario sin email', () => {
    expect(() => parseUsuario({ id: 1 })).toThrow('no cumple el contrato')
  })

  it('rechaza un usuario sin veterinario', () => {
    expect(() => parseUsuario({ id: 1, email: 'a@b.es' })).toThrow('veterinario')
  })
})
