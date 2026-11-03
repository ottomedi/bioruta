import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DataTable, type Columna } from './DataTable'

interface Fila {
  readonly id: number
  readonly nombre: string
  readonly km: number
}

const FILAS: readonly Fila[] = [
  { id: 1, nombre: 'Binéfar', km: 12 },
  { id: 2, nombre: 'Albelda', km: 3 },
  { id: 3, nombre: 'Esplús', km: 7 },
]

const COLUMNAS: readonly Columna<Fila>[] = [
  { key: 'nombre', header: 'Nombre', render: (f) => f.nombre, sortValue: (f) => f.nombre },
  { key: 'km', header: 'Km', render: (f) => f.km, sortValue: (f) => f.km },
]

function renderTabla() {
  render(
    <DataTable
      caption="Granjas"
      columns={COLUMNAS}
      rows={FILAS}
      getRowId={(f) => f.id}
      getSearchText={(f) => f.nombre}
      emptyMessage="Nada por aquí."
    />,
  )
}

function nombresEnOrden(): string[] {
  const filas = screen.getAllByRole('row').slice(1)
  return filas.map((fila) => within(fila).getAllByRole('cell')[0].textContent ?? '')
}

describe('DataTable', () => {
  it('ordena por una columna numérica y alterna la dirección', async () => {
    renderTabla()
    const cabecera = screen.getByRole('button', { name: 'Km' })

    await userEvent.click(cabecera)
    expect(nombresEnOrden()).toEqual(['Albelda', 'Esplús', 'Binéfar'])
    expect(screen.getByRole('columnheader', { name: 'Km' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    )

    await userEvent.click(cabecera)
    expect(nombresEnOrden()).toEqual(['Binéfar', 'Esplús', 'Albelda'])
  })

  it('al cambiar de columna vuelve a empezar en ascendente', async () => {
    renderTabla()

    await userEvent.click(screen.getByRole('button', { name: 'Km' }))
    await userEvent.click(screen.getByRole('button', { name: 'Km' }))
    await userEvent.click(screen.getByRole('button', { name: 'Nombre' }))

    expect(nombresEnOrden()).toEqual(['Albelda', 'Binéfar', 'Esplús'])
  })

  it('filtra sin tener en cuenta tildes ni mayúsculas', async () => {
    renderTabla()

    await userEvent.type(screen.getByRole('searchbox'), 'BINEFAR')

    expect(nombresEnOrden()).toEqual(['Binéfar'])
  })

  it('avisa cuando el filtro no deja ninguna fila', async () => {
    renderTabla()

    await userEvent.type(screen.getByRole('searchbox'), 'zzz')

    expect(screen.getByText('Nada por aquí.')).toBeInTheDocument()
  })
})
