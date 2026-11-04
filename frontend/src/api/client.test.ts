import { describe, expect, it, vi } from 'vitest'
import { ApiRequestError, createApiClient } from './client'

const BASE = 'http://api.test'

function client(token: string | null = 'abc', onUnauthorized = vi.fn()) {
  return {
    request: createApiClient({ baseUrl: BASE, getToken: () => token, onUnauthorized }),
    onUnauthorized,
  }
}

function stubFetch(response: Response | Error | DOMException) {
  // En jsdom DOMException no hereda de Error: se distingue por ser o no una respuesta.
  const fetchMock =
    response instanceof Response
      ? vi.fn().mockResolvedValue(response)
      : vi.fn().mockRejectedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('cliente de la API', () => {
  it('añade el token y devuelve el JSON', async () => {
    const fetchMock = stubFetch(Response.json({ ok: true }))

    const data = await client().request('/auth/me')

    expect(data).toEqual({ ok: true })
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${BASE}/auth/me`)
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer abc')
  })

  it('sin token no manda cabecera de autorización', async () => {
    const fetchMock = stubFetch(Response.json({}))

    await client(null).request('/auth/demo', { method: 'POST' })

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(new Headers(init.headers).has('Authorization')).toBe(false)
  })

  it('marca el cuerpo como JSON cuando lo hay', async () => {
    const fetchMock = stubFetch(Response.json({}))

    await client(null).request('/auth/login', { method: 'POST', body: '{}' })

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(new Headers(init.headers).get('Content-Type')).toBe('application/json')
  })

  it('con FormData deja que el navegador ponga el Content-Type', async () => {
    const fetchMock = stubFetch(Response.json({}))

    await client().request('/import', { method: 'POST', body: new FormData() })

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(new Headers(init.headers).has('Content-Type')).toBe(false)
  })

  it('convierte un error del contrato en ApiRequestError con su mensaje', async () => {
    stubFetch(Response.json({ codigo: 'no_encontrado', mensaje: 'No existe.' }, { status: 404 }))

    const error = await client()
      .request('/granjas/99')
      .catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiRequestError)
    expect(error).toMatchObject({ status: 404, codigo: 'no_encontrado', message: 'No existe.' })
  })

  it('da un mensaje propio si el error no trae el formato del contrato', async () => {
    stubFetch(new Response('Bad Gateway', { status: 502 }))

    await expect(client().request('/granjas')).rejects.toMatchObject({
      status: 502,
      message: 'El servidor ha respondido con el código 502.',
    })
  })

  it('avisa del 401 cuando la petición llevaba token', async () => {
    stubFetch(Response.json({ codigo: 'no_autorizado', mensaje: 'Caducado.' }, { status: 401 }))
    const { request, onUnauthorized } = client('caducado')

    await expect(request('/auth/me')).rejects.toMatchObject({ status: 401 })
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })

  it('no avisa del 401 de un login sin token (credenciales malas)', async () => {
    stubFetch(Response.json({ codigo: 'credenciales_invalidas', mensaje: 'No.' }, { status: 401 }))
    const { request, onUnauthorized } = client(null)

    await expect(request('/auth/login', { method: 'POST' })).rejects.toMatchObject({
      codigo: 'credenciales_invalidas',
    })
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('traduce un fallo de red a un mensaje legible', async () => {
    stubFetch(new TypeError('Failed to fetch'))

    await expect(client().request('/granjas')).rejects.toMatchObject({
      status: 0,
      codigo: 'sin_conexion',
      message: 'No se ha podido conectar con el servidor.',
    })
  })

  it('deja pasar la cancelación sin convertirla', async () => {
    stubFetch(new DOMException('Cancelada', 'AbortError'))

    await expect(client().request('/auth/me')).rejects.toMatchObject({ name: 'AbortError' })
  })
})
