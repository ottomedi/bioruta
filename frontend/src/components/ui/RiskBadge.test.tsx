import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EstadoBadge, RiskBadge } from './RiskBadge'

describe('RiskBadge', () => {
  it('enseña el nombre del nivel con un icono, no solo el color', () => {
    const { container } = render(<RiskBadge nivel="alto" />)

    expect(screen.getByText('Riesgo alto')).toBeInTheDocument()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('pinta cada estado con el color de su nivel y su nombre en español', () => {
    render(<EstadoBadge estado="zona_vigilancia" />)

    const badge = screen.getByText('Zona de vigilancia')
    expect(badge.className).toContain('text-riesgo-medio')
  })
})
