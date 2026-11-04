import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Paginacion } from './Paginacion'

describe('Paginacion', () => {
  it('no se enseña con una sola página', () => {
    const { container } = render(<Paginacion page={1} limit={25} total={6} onCambiar={vi.fn()} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('avanza y retrocede, y desactiva los extremos', async () => {
    const onCambiar = vi.fn()
    render(<Paginacion page={1} limit={25} total={60} onCambiar={onCambiar} />)

    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

    expect(onCambiar).toHaveBeenCalledWith(2)
  })

  it('en la última página no deja seguir', () => {
    render(<Paginacion page={3} limit={25} total={60} onCambiar={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
  })
})
