import { describe, expect, it } from 'vitest'
import { parseFlag, resolveApiUrl } from './config'

describe('parseFlag', () => {
  it('solo activa con «true», sin importar mayúsculas ni espacios', () => {
    expect(parseFlag('true')).toBe(true)
    expect(parseFlag(' TRUE ')).toBe(true)
  })

  it('deja desactivado cualquier otro valor', () => {
    for (const raw of [undefined, '', 'false', '1', 'yes']) {
      expect(parseFlag(raw)).toBe(false)
    }
  })
})

describe('resolveApiUrl', () => {
  it('usa el backend local en desarrollo cuando no hay variable', () => {
    expect(resolveApiUrl(undefined, false)).toBe('http://localhost:8000')
    expect(resolveApiUrl('  ', false)).toBe('http://localhost:8000')
  })

  it('falla en producción cuando no hay variable', () => {
    expect(() => resolveApiUrl(undefined, true)).toThrow(/VITE_API_URL/)
  })

  it('quita las barras finales para no duplicarlas al montar rutas', () => {
    expect(resolveApiUrl('https://api.example.com//', true)).toBe('https://api.example.com')
  })
})
