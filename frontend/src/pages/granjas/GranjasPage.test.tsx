import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw/http'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { API_URL } from '../../config'
import { GRANJAS } from '../../mocks/fixtures'
import { handlers } from '../../mocks/handlers'
import { conSesionDemo, renderApp } from '../../test/renderApp'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

async function filas() {
  const tabla = await screen.findByRole('table', { name: 'Granjas' })
  // La primera fila es la cabecera.
  return within(tabla).getAllByRole('row').slice(1)
}

describe('lista de granjas', () => {
  beforeEach(() => {
    conSesionDemo()
  })

  it('enseña todas las granjas con su estado y enlace a la ficha', async () => {
    renderApp('/granjas')

    expect(await filas()).toHaveLength(GRANJAS.length)
    expect(screen.getByText(`${GRANJAS.length} granjas`)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cebo Los Almendros' })).toHaveAttribute(
      'href',
      '/granjas/6',
    )
    expect(screen.getByText('PPA')).toBeInTheDocument()
  })

  it('filtra por estado y lo guarda en la URL', async () => {
    const router = renderApp('/granjas')
    await filas()

    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'positiva')

    await waitFor(async () => expect(await filas()).toHaveLength(1))
    expect(router.state.location.search).toBe('?estado=positiva')
    expect(screen.getByText('1 granja con estos filtros')).toBeInTheDocument()
  })

  it('lee los filtros de la URL al entrar y los quita con un botón', async () => {
    renderApp('/granjas?tipo=cebo')

    expect(await filas()).toHaveLength(2)
    expect(screen.getByLabelText('Tipo')).toHaveValue('cebo')

    await userEvent.click(screen.getByRole('button', { name: 'Quitar filtros' }))

    await waitFor(async () => expect(await filas()).toHaveLength(GRANJAS.length))
    expect(screen.getByLabelText('Tipo')).toHaveValue('')
  })

  it('busca por texto al dejar de escribir', async () => {
    const router = renderApp('/granjas')
    await filas()

    await userEvent.type(screen.getByLabelText('Buscar'), 'binefar')

    await waitFor(() => expect(router.state.location.search).toBe('?q=binefar'))
    await waitFor(async () => expect(await filas()).toHaveLength(1))
  })

  it('Quitar filtros borra la búsqueda y no vuelve a aparecer', async () => {
    const router = renderApp('/granjas?q=binefar')
    expect(await filas()).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: 'Quitar filtros' }))
    // Más que la espera del buscador, por si volviera a mandar la búsqueda vieja.
    await new Promise((r) => setTimeout(r, 400))

    expect(router.state.location.search).toBe('')
    expect(screen.getByLabelText('Buscar')).toHaveValue('')
  })

  it('una página que no existe lleva a la última', async () => {
    const router = renderApp('/granjas?page=9')

    await waitFor(() => expect(router.state.location.search).toBe(''))
    // Mientras carga la página buena se sigue viendo la vacía: hay que esperar a la nueva.
    await waitFor(async () => expect(await filas()).toHaveLength(GRANJAS.length))
  })

  it('carga las zonas en el desplegable', async () => {
    renderApp('/granjas')

    const zona = await screen.findByLabelText('Zona')
    expect(await within(zona).findByRole('option', { name: 'La Litera' })).toBeInTheDocument()
  })

  it('dice cuándo ninguna granja cumple los filtros', async () => {
    renderApp('/granjas?q=no-existe')

    expect(await screen.findByText('Ninguna granja cumple estos filtros.')).toBeInTheDocument()
  })

  it('si falla la carga, lo dice y deja reintentar', async () => {
    let fallar = true
    server.use(
      http.get(`${API_URL}/granjas`, () => {
        if (!fallar) return undefined
        return HttpResponse.json(
          { codigo: 'error_interno', mensaje: 'El servidor ha fallado.' },
          { status: 500 },
        )
      }),
    )
    renderApp('/granjas')

    expect(await screen.findByText('El servidor ha fallado.')).toBeInTheDocument()

    fallar = false
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await filas()).toHaveLength(GRANJAS.length)
  })
})
