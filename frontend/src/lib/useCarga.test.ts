import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCarga } from './useCarga'

/** Una promesa que el test resuelve cuando quiere. */
function diferida<T>() {
  let resolver: (valor: T) => void = () => {}
  const promesa = new Promise<T>((r) => {
    resolver = r
  })
  return { promesa, resolver }
}

describe('useCarga', () => {
  it('pasa de cargando a ok con los datos', async () => {
    const cargar = () => Promise.resolve(42)
    const { result } = renderHook(() => useCarga(cargar))

    expect(result.current[0]).toEqual({ kind: 'cargando' })
    await waitFor(() => expect(result.current[0]).toEqual({ kind: 'ok', datos: 42 }))
  })

  it('guarda el mensaje y el error original si falla', async () => {
    const fallo = new Error('Sin red.')
    const cargar = () => Promise.reject(fallo)
    const { result } = renderHook(() => useCarga(cargar))

    await waitFor(() =>
      expect(result.current[0]).toEqual({ kind: 'error', mensaje: 'Sin red.', error: fallo }),
    )
  })

  it('una respuesta vieja no pisa la de la carga nueva', async () => {
    const vieja = diferida<string>()
    const cargarVieja = () => vieja.promesa
    const cargarNueva = () => Promise.resolve('nueva')
    const { result, rerender } = renderHook(({ cargar }) => useCarga(cargar), {
      initialProps: { cargar: cargarVieja },
    })

    rerender({ cargar: cargarNueva })
    await waitFor(() => expect(result.current[0]).toEqual({ kind: 'ok', datos: 'nueva' }))
    await act(async () => vieja.resolver('vieja'))

    expect(result.current[0]).toEqual({ kind: 'ok', datos: 'nueva' })
  })

  it('mientras carga de nuevo ofrece los datos anteriores', async () => {
    const nueva = diferida<string>()
    const { result, rerender } = renderHook(({ cargar }) => useCarga(cargar), {
      initialProps: { cargar: () => Promise.resolve('primera') },
    })
    await waitFor(() => expect(result.current[0]).toEqual({ kind: 'ok', datos: 'primera' }))

    rerender({ cargar: () => nueva.promesa })

    expect(result.current[0]).toEqual({ kind: 'cargando', previos: 'primera' })
    await act(async () => nueva.resolver('segunda'))
    expect(result.current[0]).toEqual({ kind: 'ok', datos: 'segunda' })
  })

  it('reintentar vuelve a cargar', async () => {
    let llamadas = 0
    const cargar = () => Promise.resolve(++llamadas)
    const { result } = renderHook(() => useCarga(cargar))
    await waitFor(() => expect(result.current[0]).toEqual({ kind: 'ok', datos: 1 }))

    act(() => result.current[1]())

    await waitFor(() => expect(result.current[0]).toEqual({ kind: 'ok', datos: 2 }))
  })
})
