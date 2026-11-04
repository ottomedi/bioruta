import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { reiniciarAlmacen } from '../../mocks/almacen'
import { GRANJAS } from '../../mocks/fixtures'
import { handlers } from '../../mocks/handlers'
import { conSesionDemo, renderApp } from '../../test/renderApp'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  server.resetHandlers()
  reiniciarAlmacen()
})
afterAll(() => server.close())

const CSV = [
  'codigo_rega,nombre,tipo,latitud,longitud,municipio,provincia,zona',
  'ES9,Granja Importada,cebo,41.7,0.6,Almacelles,Lleida,Segrià',
  ',Sin tipo,,41.8,0.3,Esplús,Huesca,',
].join('\n')

describe('importar fichero', () => {
  beforeEach(() => {
    conSesionDemo()
  })

  it('sube el CSV, enseña el informe y la granja nueva sale en la lista', async () => {
    renderApp('/granjas/importar')
    const fichero = new File([CSV], 'granjas.csv', { type: 'text/csv' })

    await userEvent.upload(await screen.findByLabelText('Fichero'), fichero)
    await userEvent.click(screen.getByRole('button', { name: 'Importar' }))

    expect(
      await screen.findByRole('heading', { name: 'Informe de importación' }),
    ).toBeInTheDocument()
    const errores = screen.getByRole('table', { name: 'Errores por fila' })
    expect(within(errores).getByText('Falta el campo tipo.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Informe de importación' })).toHaveFocus()

    await userEvent.click(screen.getByRole('link', { name: 'Ver las granjas en la lista' }))

    expect(await screen.findByRole('link', { name: 'Granja Importada' })).toBeInTheDocument()
    expect(screen.getByText(`${GRANJAS.length + 1} granjas`)).toBeInTheDocument()
  })

  it('pide un fichero si se pulsa Importar sin elegirlo', async () => {
    renderApp('/granjas/importar')

    await userEvent.click(await screen.findByRole('button', { name: 'Importar' }))

    expect(screen.getByText('Elige un fichero antes de importar.')).toBeInTheDocument()
  })

  it('enseña el error del backend', async () => {
    renderApp('/granjas/importar')

    await userEvent.selectOptions(await screen.findByLabelText('Qué contiene'), 'visitas')
    await userEvent.upload(screen.getByLabelText('Fichero'), new File(['x'], 'v.csv'))
    await userEvent.click(screen.getByRole('button', { name: 'Importar' }))

    expect(await screen.findByText('Los mocks solo saben importar granjas.')).toBeInTheDocument()
  })
})
