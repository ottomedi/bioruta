import { describe, expect, it, vi } from 'vitest'
import { fetchHealth, parseHealth } from './health'

const BASE_URL = 'https://api.test'

function stubFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('parseHealth', () => {
  it('acepta la respuesta del contrato', () => {
    expect(parseHealth({ estado: 'ok', version: '0.1.0' })).toEqual({
      estado: 'ok',
      version: '0.1.0',
    })
  })

  it('rechaza el formato antiguo del backend (status y environment)', () => {
    expect(() => parseHealth({ status: 'ok', environment: 'dev' })).toThrow(/contrato/)
  })

  it('rechaza lo que no es un objeto', () => {
    expect(() => parseHealth(null)).toThrow(/objeto/)
    expect(() => parseHealth('ok')).toThrow(/objeto/)
  })
})

describe('fetchHealth', () => {
  it('llama a /health de la URL indicada y devuelve los datos', async () => {
    const fetchMock = stubFetch(Response.json({ estado: 'ok', version: '1.2.3' }))

    const health = await fetchHealth(undefined, BASE_URL)

    expect(health.version).toBe('1.2.3')
    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/health`, expect.any(Object))
  })

  it('lanza un error con el código cuando la respuesta no es correcta', async () => {
    stubFetch(new Response('caído', { status: 503 }))

    await expect(fetchHealth(undefined, BASE_URL)).rejects.toThrow(/503/)
  })

  it('respeta la señal de cancelación que recibe', async () => {
    const fetchMock = stubFetch(Response.json({ estado: 'ok', version: '1' }))
    const controller = new AbortController()

    await fetchHealth(controller.signal, BASE_URL)
    controller.abort()

    const { signal } = fetchMock.mock.calls[0][1] as RequestInit
    expect(signal?.aborted).toBe(true)
  })
})
