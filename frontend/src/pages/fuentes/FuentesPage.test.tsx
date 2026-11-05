import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw/http'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { API_URL } from '../../config'
import { handlers } from '../../mocks/handlers'
import { REGLAS } from '../../mocks/reglas'
import { conSesionDemo, renderApp } from '../../test/renderApp'

const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
  // jsdom no implementa scrollIntoView; los navegadores sí.
  Element.prototype.scrollIntoView = () => {}
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function ficha(id: string) {
  return screen.getByRole('article', { name: new RegExp(`^${id} `) })
}

describe('de dónde salen las reglas', () => {
  beforeEach(() => {
    conSesionDemo()
  })

  it('enseña todas las reglas con su tipo, fuente y enlace', async () => {
    renderApp('/fuentes')

    expect(await screen.findAllByRole('article')).toHaveLength(REGLAS.length)
    const r02 = ficha('R02')
    expect(within(r02).getByText('Guía')).toBeInTheDocument()
    expect(within(r02).getByRole('link', { name: /Abrir el documento/ })).toHaveAttribute(
      'href',
      expect.stringContaining('mapa.gob.es'),
    )
  })

  it('dice cuándo una regla tiene fuente solo en parte', async () => {
    renderApp('/fuentes')
    await screen.findAllByRole('article')

    expect(within(ficha('R10')).getByText('con fuente en parte')).toBeInTheDocument()
    expect(within(ficha('R08')).queryByText('con fuente en parte')).not.toBeInTheDocument()
  })

  it('dice cuándo una regla no tiene fuente y no pinta enlace', async () => {
    server.use(
      http.get(`${API_URL}/reglas`, () =>
        HttpResponse.json([
          { ...REGLAS[0], tipo: 'supuesto', fuente: null, url: null, cita: null },
        ]),
      ),
    )
    renderApp('/fuentes')

    const regla = await screen.findByRole('article')
    expect(within(regla).getByText(/Sin fuente: es una decisión nuestra/)).toBeInTheDocument()
    expect(within(regla).queryByRole('link')).not.toBeInTheDocument()
  })

  it('cuenta cuántas reglas hay de cada tipo', async () => {
    renderApp('/fuentes')
    await screen.findAllByRole('article')

    const resumen = screen.getByRole('region', { name: 'Qué significa cada tipo' })
    for (const [tipo, etiqueta] of [
      ['normativa', 'Normativa'],
      ['guia', 'Guía'],
      ['supuesto', 'Supuesto'],
    ] as const) {
      const tarjeta = within(resumen).getByText(etiqueta).closest('div') as HTMLElement
      const total = REGLAS.filter((r) => r.tipo === tipo).length
      expect(within(tarjeta).getByText(String(total))).toBeInTheDocument()
    }
    const parciales = REGLAS.filter((r) => r.tipo === 'supuesto' && r.fuente).length
    expect(
      within(resumen).getByText(`${parciales} de ellas tienen fuente en una parte.`),
    ).toBeInTheDocument()
  })

  it('con #R07 en la URL lleva el foco a esa regla', async () => {
    renderApp('/fuentes#R07')

    await screen.findAllByRole('article')

    // El foco se mueve en un efecto, justo después de pintar la lista.
    await waitFor(() => expect(ficha('R07')).toHaveFocus())
  })

  it('un hash mal escrito no rompe la pantalla', async () => {
    renderApp('/fuentes#%')

    expect(await screen.findAllByRole('article')).toHaveLength(REGLAS.length)
  })

  it('una regla con un tipo desconocido da error de carga en vez de romper la pantalla', async () => {
    server.use(
      http.get(`${API_URL}/reglas`, () => HttpResponse.json([{ ...REGLAS[0], tipo: 'otro' }])),
    )
    renderApp('/fuentes')

    expect(await screen.findByText('La hoja de reglas no cumple el contrato.')).toBeInTheDocument()
  })

  it('no pinta como enlace una URL que no sea http', async () => {
    server.use(
      http.get(`${API_URL}/reglas`, () =>
        HttpResponse.json([{ ...REGLAS[0], url: 'javascript:alert(1)' }]),
      ),
    )
    renderApp('/fuentes')

    expect(await screen.findByRole('article')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Abrir el documento/ })).not.toBeInTheDocument()
  })
})
