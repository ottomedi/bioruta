import { describe, expect, it } from 'vitest'
import { distanciaKm } from './geo'

describe('distanciaKm', () => {
  it('es 0 entre un punto y él mismo', () => {
    const p = { latitud: 41.87, longitud: 0.31 }
    expect(distanciaKm(p, p)).toBe(0)
  })

  it('da la distancia de Madrid a Barcelona en línea recta (unos 505 km)', () => {
    const madrid = { latitud: 40.4168, longitud: -3.7038 }
    const barcelona = { latitud: 41.3874, longitud: 2.1686 }
    expect(distanciaKm(madrid, barcelona)).toBeCloseTo(505, -1)
  })
})
