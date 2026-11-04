import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState, type ReactNode } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import type { Granja } from '../../api/types'
import { calcularComparacion } from '../../mocks/calcularRutas'
import { GRANJAS, USUARIO_DEMO } from '../../mocks/fixtures'
import { MapView } from './MapView'

const BASE = USUARIO_DEMO.veterinario.base

function enRouter(elemento: ReactNode) {
  const router = createMemoryRouter([{ path: '/', element: elemento }])
  return render(<RouterProvider router={router} />)
}

function tramosPeligrosos(container: HTMLElement) {
  return container.querySelectorAll('path.ruta-tramo--peligroso').length
}

describe('MapView', () => {
  it('pinta un marcador por granja con su estado en el título', () => {
    enRouter(<MapView granjas={GRANJAS} base={BASE} />)

    expect(screen.getByTitle('Cebo Los Almendros, positiva')).toBeInTheDocument()
    expect(screen.getByTitle('Salida: tu base')).toBeInTheDocument()
  })

  it('numera las paradas y repinta en rojo los tramos al cambiar de ruta', async () => {
    const granjas: readonly Granja[] = GRANJAS
    const { segura, mas_corta } = calcularComparacion(BASE, granjas)
    // Sin esto el test no probaría nada: la más corta tiene que tener exposiciones.
    expect(mas_corta.exposiciones).toBeGreaterThan(0)

    /** El mismo mapa con un botón para cambiar de ruta, sin desmontarlo. */
    function Alternar() {
      const [corta, setCorta] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setCorta(true)}>
            Más corta
          </button>
          <MapView granjas={granjas} base={BASE} ruta={corta ? mas_corta : segura} />
        </>
      )
    }
    const { container } = enRouter(<Alternar />)

    expect(screen.getByTitle(/^Parada 1: /)).toBeInTheDocument()
    expect(tramosPeligrosos(container)).toBe(segura.exposiciones)

    await userEvent.click(screen.getByRole('button', { name: 'Más corta' }))

    expect(tramosPeligrosos(container)).toBe(mas_corta.exposiciones)
  })
})
