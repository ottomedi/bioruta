import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

/** La pantalla carga Leaflet aparte: la primera vez tarda más que el segundo por defecto. */
const CARGA_LAZY = { timeout: 5000 }

async function elegir(...nombres: string[]) {
  for (const nombre of nombres) {
    await userEvent.click(
      await screen.findByRole('checkbox', { name: new RegExp(nombre) }, CARGA_LAZY),
    )
  }
}

describe('ruta del día', () => {
  beforeEach(() => {
    conSesionDemo()
  })

  it('calcula la ruta de las granjas elegidas y enseña las paradas en orden', async () => {
    renderApp('/ruta')
    await screen.findByRole('heading', { name: 'Ruta del día' }, CARGA_LAZY)
    const calcular = await screen.findByRole('button', { name: 'Calcular ruta' })
    expect(calcular).toBeDisabled()

    await elegir('Cebo Los Almendros', 'Granja El Pinar')
    await userEvent.click(calcular)

    const paradas = await screen.findByRole('list', { name: 'Paradas de la ruta' })
    // La segura va primero: el núcleo genético sano antes que la positiva.
    const nombres = within(paradas)
      .getAllByRole('link')
      .map((a) => a.textContent)
      .filter((t) => t && !t.startsWith('Ver'))
    expect(nombres).toEqual(['Granja El Pinar', 'Cebo Los Almendros'])
    expect(screen.getByRole('radio', { name: /Segura/ })).toBeChecked()
    // Cada parada enlaza a la regla que decidió su posición.
    expect(within(paradas).getAllByRole('link', { name: 'Ver R01' })[0]).toHaveAttribute(
      'href',
      '/fuentes#R01',
    )
  })

  it('cambia a la ruta más corta con el selector', async () => {
    renderApp('/ruta')
    await elegir('Granja El Pinar', 'Porcino Las Eras')
    await userEvent.click(screen.getByRole('button', { name: 'Calcular ruta' }))
    await screen.findByRole('list', { name: 'Paradas de la ruta' })

    await userEvent.click(screen.getByRole('radio', { name: /Más corta/ }))

    expect(screen.getByRole('radio', { name: /Más corta/ })).toBeChecked()
    expect(screen.getAllByText(/Es la granja más cercana/).length).toBeGreaterThan(0)
  })

  it('vuelve a la selección sin perder las granjas elegidas', async () => {
    renderApp('/ruta')
    await elegir('Granja El Pinar')
    await userEvent.click(screen.getByRole('button', { name: 'Calcular ruta' }))
    await screen.findByRole('list', { name: 'Paradas de la ruta' })

    await userEvent.click(screen.getByRole('button', { name: 'Cambiar granjas' }))

    expect(screen.getByRole('checkbox', { name: /Granja El Pinar/ })).toBeChecked()
    expect(screen.getByText('1 de 20 como máximo')).toBeInTheDocument()
  })

  it('enseña el error del backend si la ruta es imposible', async () => {
    server.use(
      http.post(`${API_URL}/rutas/calcular`, () =>
        HttpResponse.json(
          { codigo: 'ruta_imposible', mensaje: 'No se puede entrar en el núcleo genético (R07).' },
          { status: 422 },
        ),
      ),
    )
    renderApp('/ruta')
    await elegir('Granja El Pinar')

    await userEvent.click(screen.getByRole('button', { name: 'Calcular ruta' }))

    expect(
      await screen.findByText('No se puede entrar en el núcleo genético (R07).'),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Calcular ruta' })).not.toHaveAttribute(
        'aria-busy',
      ),
    )
  })
})
