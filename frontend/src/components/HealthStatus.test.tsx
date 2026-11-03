import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HealthStatus } from './HealthStatus'

describe('HealthStatus', () => {
  it('avisa mientras conecta', () => {
    render(<HealthStatus load={() => new Promise(() => {})} />)

    expect(screen.getByRole('status')).toHaveTextContent('Conectando con el servidor')
  })

  it('enseña la versión cuando el backend responde', async () => {
    render(<HealthStatus load={() => Promise.resolve({ estado: 'ok', version: '0.1.0' })} />)

    expect(await screen.findByText('Servidor en línea (v0.1.0)')).toBeInTheDocument()
  })

  it('enseña el error con su detalle cuando el backend falla', async () => {
    render(<HealthStatus load={() => Promise.reject(new Error('Sin red'))} />)

    const status = await screen.findByText('Servidor no disponible')
    expect(status).toHaveAttribute('title', 'Sin red')
  })

  it('cancela la petición al desmontarse', () => {
    const load = vi.fn((_signal: AbortSignal) => new Promise<never>(() => {}))
    const { unmount } = render(<HealthStatus load={load} />)

    unmount()

    expect(load.mock.calls[0][0].aborted).toBe(true)
  })
})
