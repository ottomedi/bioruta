import { describe, expect, it } from 'vitest'
import { formatearFechaHora, hoyEnMadrid } from './fecha'

describe('fechas en hora de Madrid', () => {
  it('el día de hoy usa la zona de Madrid y no la UTC', () => {
    // 23:30 UTC del 3 de noviembre ya es 4 de noviembre en Madrid (UTC+1).
    expect(hoyEnMadrid(new Date('2026-11-03T23:30:00Z'))).toBe('2026-11-04')
  })

  it('enseña la hora local', () => {
    expect(formatearFechaHora('2026-11-03T23:30:00Z')).toContain('00:30')
  })
})
