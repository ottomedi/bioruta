import { describe, expect, it } from 'vitest'
import type { Granja } from '../api/types'
import { calcularComparacion, ordenMasCorta, ordenSegura } from './calcularRutas'
import { GRANJAS, USUARIO_DEMO } from './fixtures'

const BASE = USUARIO_DEMO.veterinario.base

function granja(id: number): Granja {
  const g = GRANJAS.find((x) => x.id === id)
  if (!g) throw new Error(`Falta la granja ${id}`)
  return g
}

describe('cálculo de rutas de los mocks', () => {
  it('la más corta va siempre a la granja más cercana', () => {
    const cerca = { ...granja(1), id: 101, coordenadas: { latitud: 41.86, longitud: 0.3 } }
    const lejos = { ...granja(1), id: 102, coordenadas: { latitud: 42.2, longitud: 0.3 } }

    expect(ordenMasCorta(BASE, [lejos, cerca]).map((g) => g.id)).toEqual([101, 102])
  })

  it('la segura deja las positivas al final y pone antes el núcleo genético', () => {
    const orden = ordenSegura(BASE, [granja(6), granja(4), granja(5), granja(1)])

    // 1 núcleo genético sano, 5 transición sana, 4 sospechosa, 6 positiva.
    expect(orden.map((g) => g.id)).toEqual([1, 5, 4, 6])
  })

  it('maternidad y ciclo cerrado comparten posición: decide la cercanía (R08)', () => {
    const base = { latitud: 41.8, longitud: 0.3 }
    const maternidadLejos = {
      ...granja(1),
      id: 201,
      tipo: 'maternidad' as const,
      coordenadas: { latitud: 42.2, longitud: 0.3 },
    }
    const cicloCerca = {
      ...granja(1),
      id: 202,
      tipo: 'ciclo_cerrado' as const,
      coordenadas: { latitud: 41.81, longitud: 0.3 },
    }
    const nucleo = { ...granja(1), id: 203, coordenadas: { latitud: 42.3, longitud: 0.3 } }

    // El núcleo va primero aunque esté lejos; después, entre las dos de cerdas, la más cercana a él.
    expect(ordenSegura(base, [cicloCerca, maternidadLejos, nucleo]).map((g) => g.id)).toEqual([
      203, 201, 202,
    ])
  })

  it('marca como peligroso el tramo que llega a una granja con menos riesgo que una anterior', () => {
    const { mas_corta, segura } = calcularComparacion(BASE, [granja(6), granja(1)])

    expect(segura.exposiciones).toBe(0)
    const ordenCorta = mas_corta.paradas.map((p) => p.granja.id)
    const despuesDePositiva = ordenCorta.indexOf(6) < ordenCorta.indexOf(1)
    expect(mas_corta.exposiciones).toBe(despuesDePositiva ? 1 : 0)
  })

  it('la geometría empieza en la base y tiene un punto por parada', () => {
    const { segura } = calcularComparacion(BASE, [granja(1), granja(2), granja(3)])

    expect(segura.geometria[0]).toEqual(BASE)
    expect(segura.geometria).toHaveLength(4)
    expect(segura.paradas.map((p) => p.orden)).toEqual([1, 2, 3])
    expect(segura.km_total).toBeGreaterThan(0)
  })
})
