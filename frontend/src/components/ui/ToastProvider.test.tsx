import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useToast } from './toastContext'
import { MAX_TOASTS, TOAST_MS, ToastProvider } from './ToastProvider'

function Disparador() {
  const toast = useToast()
  return (
    <>
      <button onClick={() => toast.show('exito', 'Visita registrada.')}>ok</button>
      <button onClick={() => toast.show('error', 'Sin red.')}>ko</button>
    </>
  )
}

function renderConProvider() {
  render(
    <ToastProvider>
      <Disparador />
    </ToastProvider>,
  )
}

describe('ToastProvider', () => {
  it('los errores se anuncian como alerta y el resto como estado', async () => {
    renderConProvider()

    await userEvent.click(screen.getByText('ok'))
    await userEvent.click(screen.getByText('ko'))

    expect(screen.getByRole('status')).toHaveTextContent('Visita registrada.')
    expect(screen.getByRole('alert')).toHaveTextContent('Sin red.')
  })

  it('se cierra solo pasado el tiempo', () => {
    vi.useFakeTimers()
    try {
      renderConProvider()

      act(() => screen.getByText('ok').click())
      expect(screen.getByText('Visita registrada.')).toBeInTheDocument()

      act(() => vi.advanceTimersByTime(TOAST_MS))
      expect(screen.queryByText('Visita registrada.')).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('los errores no se cierran solos', () => {
    vi.useFakeTimers()
    try {
      renderConProvider()

      act(() => screen.getByText('ko').click())
      act(() => vi.advanceTimersByTime(TOAST_MS * 3))

      expect(screen.getByText('Sin red.')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it(`no acumula más de ${MAX_TOASTS} avisos`, async () => {
    renderConProvider()

    for (let i = 0; i < MAX_TOASTS + 2; i++) {
      await userEvent.click(screen.getByText('ko'))
    }

    expect(screen.getAllByText('Sin red.')).toHaveLength(MAX_TOASTS)
  })

  it('se puede cerrar a mano', async () => {
    renderConProvider()

    await userEvent.click(screen.getByText('ok'))
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }))

    expect(screen.queryByText('Visita registrada.')).not.toBeInTheDocument()
  })

  it('useToast falla con un mensaje claro si falta el provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<Disparador />)).toThrow(/ToastProvider/)
  })
})
