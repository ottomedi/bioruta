import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { fetchHealth } from '../api/health'
import { API_URL } from '../config'
import { GRANJAS, TOKEN_DEMO } from './fixtures'
import { filtrarGranjas, handlers } from './handlers'

const server = setupServer(...handlers)
const AUTH = { Authorization: `Bearer ${TOKEN_DEMO}` }

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function get(path: string, headers: HeadersInit = AUTH) {
  return fetch(`${API_URL}${path}`, { headers })
}

describe('handlers de MSW', () => {
  it('responden a /health con el formato del contrato', async () => {
    expect(await fetchHealth()).toEqual({ estado: 'ok', version: 'mock' })
  })

  it('dan un token de demo y el usuario con ese token', async () => {
    const login = await fetch(`${API_URL}/auth/demo`, { method: 'POST' })
    const { access_token } = await login.json()

    const me = await get('/auth/me', { Authorization: `Bearer ${access_token}` })

    expect(me.status).toBe(200)
    expect((await me.json()).email).toBe('demo@bioruta.es')
  })

  it('rechazan un login con un email desconocido', async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'otro@example.com', password: 'x' }),
    })

    expect(response.status).toBe(401)
    expect((await response.json()).codigo).toBe('credenciales_invalidas')
  })

  it('rechazan con 422 un login sin contraseña o con un cuerpo roto', async () => {
    for (const body of [JSON.stringify({ email: 'demo@bioruta.es' }), 'no es json']) {
      const response = await fetch(`${API_URL}/auth/login`, { method: 'POST', body })

      expect(response.status).toBe(422)
      expect((await response.json()).codigo).toBe('validacion')
    }
  })

  it('devuelven 401 con el formato de error cuando falta el token', async () => {
    const response = await get('/granjas', {})

    expect(response.status).toBe(401)
    expect(await response.json()).toMatchObject({ codigo: 'no_autorizado' })
  })

  it('paginan /granjas', async () => {
    const response = await get('/granjas?page=2&limit=4')

    expect(await response.json()).toMatchObject({ total: GRANJAS.length, page: 2, limit: 4 })
  })

  it('devuelven una granja por id y 404 si no existe', async () => {
    expect((await (await get('/granjas/1')).json()).nombre).toBe('Granja El Pinar')
    expect((await get('/granjas/999')).status).toBe(404)
  })

  it('devuelven la hoja de reglas', async () => {
    const reglas = await (await get('/reglas')).json()

    expect(reglas).toHaveLength(10)
  })
})

describe('filtrarGranjas', () => {
  it('filtra por estado y tipo a la vez', () => {
    const params = new URLSearchParams({ estado: 'sin_incidencias', tipo: 'nucleo_genetico' })

    expect(filtrarGranjas(GRANJAS, params).map((g) => g.id)).toEqual([1])
  })

  it('busca en nombre y municipio sin distinguir mayúsculas', () => {
    expect(filtrarGranjas(GRANJAS, new URLSearchParams({ q: 'binéfar' }))).toHaveLength(1)
    expect(filtrarGranjas(GRANJAS, new URLSearchParams({ q: 'CEBO' }))).toHaveLength(1)
  })
})
