import { describe, expect, it } from 'vitest'
import { leerCsvGranjas } from './importarCsv'

const CABECERA = 'codigo_rega,nombre,tipo,latitud,longitud,municipio,provincia,zona'

describe('importador CSV de los mocks', () => {
  it('convierte las filas válidas en granjas sin incidencias', () => {
    const csv = `${CABECERA}\nES1,Granja Uno,cebo,41.8,0.3,Binéfar,Huesca,La Litera\n`

    const { filasTotales, granjas, errores } = leerCsvGranjas(csv)

    expect(filasTotales).toBe(1)
    expect(errores).toEqual([])
    expect(granjas[0]).toMatchObject({
      nombre: 'Granja Uno',
      tipo: 'cebo',
      coordenadas: { latitud: 41.8, longitud: 0.3 },
      estado_actual: 'sin_incidencias',
      zona: 'La Litera',
    })
  })

  it('informa de cada fila que falla con su número y su campo', () => {
    const csv = [
      CABECERA,
      ',Sin tipo,,41.8,0.3,Esplús,Huesca,',
      'ES2,Tipo raro,granjota,41.8,0.3,Esplús,Huesca,',
      'ES3,Lejos,cebo,141,0.3,Esplús,Huesca,',
    ].join('\n')

    const { granjas, errores } = leerCsvGranjas(csv)

    expect(granjas).toEqual([])
    expect(errores).toEqual([
      { fila: 1, campo: 'tipo', mensaje: 'Falta el campo tipo.' },
      { fila: 2, campo: 'tipo', mensaje: 'Tipo de granja desconocido: «granjota».' },
      { fila: 3, campo: 'latitud', mensaje: 'Latitud no válida.' },
    ])
  })

  it('si faltan columnas en la cabecera, lo dice en la fila 0', () => {
    const { errores } = leerCsvGranjas('nombre,tipo\nA,cebo')

    expect(errores).toHaveLength(1)
    expect(errores[0]).toMatchObject({ fila: 0, campo: null })
    expect(errores[0]?.mensaje).toContain('latitud')
  })
})
