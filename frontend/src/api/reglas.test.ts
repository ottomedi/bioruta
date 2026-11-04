import { describe, expect, it } from 'vitest'
import { enlaceSeguro } from './reglas'

describe('enlaceSeguro', () => {
  it('deja pasar los enlaces http y https', () => {
    expect(enlaceSeguro('https://www.boe.es/x')).toBe('https://www.boe.es/x')
    expect(enlaceSeguro('http://example.com')).toBe('http://example.com')
  })

  it('descarta javascript:, URLs rotas y vacíos', () => {
    expect(enlaceSeguro('javascript:alert(1)')).toBeNull()
    expect(enlaceSeguro('no es una url')).toBeNull()
    expect(enlaceSeguro(null)).toBeNull()
    expect(enlaceSeguro('')).toBeNull()
  })
})
