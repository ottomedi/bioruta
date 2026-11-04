import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw/http'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { API_URL } from '../../config'
import { handlers } from '../../mocks/handlers'
import { conSesionDemo, renderApp } from '../../test/renderApp'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function tarjeta(titulo: string) {
  return screen.getByRole('heading', { name: titulo }).closest('section') as HTMLElement
}

describe('ficha de granja', () => {
  beforeEach(() => {
    conSesionDemo()
  })

  it('enseña los datos, el historial y las últimas visitas', async () => {
    renderApp('/granjas/6')

    expect(await screen.findByRole('heading', { name: 'Cebo Los Almendros' })).toBeInTheDocument()
    expect(document.title).toBe('Cebo Los Almendros · BioRuta')
    expect(within(tarjeta('Datos')).getByText('ES220000000006')).toBeInTheDocument()

    const historial = tarjeta('Historial sanitario')
    expect(await within(historial).findAllByRole('listitem')).toHaveLength(3)
    expect(within(historial).getByText('Vigente')).toBeInTheDocument()

    const visitas = tarjeta('Últimas visitas')
    expect(await within(visitas).findByText('Sin medidas registradas al salir')).toBeInTheDocument()
  })

  it('dice que la granja no existe con un 404 o un id mal escrito', async () => {
    renderApp('/granjas/999')
    expect(await screen.findByText('Esta granja no existe')).toBeInTheDocument()
  })

  it('no pide nada al backend con un id que no es un número', async () => {
    renderApp('/granjas/abc')
    expect(await screen.findByText('Esta granja no existe')).toBeInTheDocument()
  })

  it('si fallan las visitas, el resto de la ficha se ve igual', async () => {
    server.use(http.get(`${API_URL}/visitas`, () => HttpResponse.error()))
    renderApp('/granjas/1')

    expect(await screen.findByText('No se han podido cargar las visitas')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Granja El Pinar' })).toBeInTheDocument()
  })
})
