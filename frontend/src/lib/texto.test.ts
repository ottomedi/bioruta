import { describe, expect, it } from 'vitest'
import { normalizar } from './texto'

describe('normalizar', () => {
  it('quita tildes, diéresis y mayúsculas', () => {
    expect(normalizar('  Esplús BINÉFAR Güell ')).toBe('esplus binefar guell')
  })

  it('convierte la eñe en n para que «Muñoz» se encuentre escribiendo «munoz»', () => {
    expect(normalizar('Muñoz')).toBe('munoz')
  })
})
