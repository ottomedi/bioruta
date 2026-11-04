import { describe, expect, it } from 'vitest'
import { DESTINO_POR_DEFECTO, destinoTrasEntrar } from './destino'

describe('destino tras entrar', () => {
  it('vuelve a la ruta interna de la que se venía', () => {
    expect(destinoTrasEntrar({ desde: '/granjas?estado=positiva' })).toBe(
      '/granjas?estado=positiva',
    )
  })

  it.each([
    ['sin estado', null],
    ['sin desde', {}],
    ['un número', { desde: 3 }],
    ['una URL externa', { desde: 'https://otro.sitio' }],
    ['una URL sin protocolo', { desde: '//otro.sitio' }],
    ['una barra invertida', { desde: '/\\otro.sitio' }],
    ['el propio login', { desde: '/login' }],
  ])('va a la ruta del día con %s', (_caso, state) => {
    expect(destinoTrasEntrar(state)).toBe(DESTINO_POR_DEFECTO)
  })
})
