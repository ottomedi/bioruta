import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('es de tipo button por defecto para no enviar formularios sin querer', () => {
    render(<Button>Calcular</Button>)

    expect(screen.getByRole('button', { name: 'Calcular' })).toHaveAttribute('type', 'button')
  })

  it('mientras carga se desactiva, avisa y no responde a clics', async () => {
    const onClick = vi.fn()
    render(
      <Button cargando onClick={onClick}>
        Guardar
      </Button>,
    )

    // El nombre accesible sigue siendo solo «Guardar»: el spinner es decorativo.
    const button = screen.getByRole('button', { name: 'Guardar' })
    await userEvent.click(button)

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(onClick).not.toHaveBeenCalled()
  })
})
