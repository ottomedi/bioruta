import { describe, expect, it } from 'vitest'
import { conFiltro, conPagina, GRANJAS_POR_PAGINA, hayFiltros, leerFiltros } from './filtros'

describe('filtros de la lista de granjas', () => {
  it('lee los filtros válidos de la URL', () => {
    const params = new URLSearchParams(
      'q=%20pinar%20&tipo=cebo&estado=positiva&zona=La+Litera&page=2',
    )

    expect(leerFiltros(params)).toEqual({
      page: 2,
      limit: GRANJAS_POR_PAGINA,
      q: 'pinar',
      tipo: 'cebo',
      estado: 'positiva',
      zona: 'La Litera',
    })
  })

  it('ignora valores que no existen en el contrato y páginas imposibles', () => {
    const filtros = leerFiltros(new URLSearchParams('tipo=granja&estado=rara&page=-3'))

    expect(filtros).toMatchObject({ page: 1, tipo: undefined, estado: undefined })
  })

  it('al cambiar un filtro vuelve a la primera página y quita los vacíos', () => {
    const params = new URLSearchParams('tipo=cebo&page=3')

    expect(conFiltro(params, 'estado', 'positiva').toString()).toBe('tipo=cebo&estado=positiva')
    expect(conFiltro(params, 'tipo', '').toString()).toBe('')
  })

  it('no deja page=1 en la URL', () => {
    const params = new URLSearchParams('tipo=cebo')

    expect(conPagina(params, 2).toString()).toBe('tipo=cebo&page=2')
    expect(conPagina(new URLSearchParams('page=2'), 1).toString()).toBe('')
  })

  it('la página sola no cuenta como filtro', () => {
    expect(hayFiltros(new URLSearchParams('page=2'))).toBe(false)
    expect(hayFiltros(new URLSearchParams('zona=La+Litera'))).toBe(true)
  })
})
