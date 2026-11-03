import { describe, expect, it } from 'vitest'
import { resolveApiUrl } from './config'

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
