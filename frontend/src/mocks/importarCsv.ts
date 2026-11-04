import type { Granja, InformeImportacion, TipoGranja } from '../api/types'
import { ETIQUETA_TIPO_GRANJA } from '../domain/riesgo'

/**
 * Importador de granjas solo para los mocks. Las columnas son los campos del
 * modelo (docs/modelo-dominio.md); el formato real lo fija el mapping del
 * backend. CSV sencillo: separado por comas y sin comillas.
 */
export const COLUMNAS_CSV = [
  'codigo_rega',
  'nombre',
  'tipo',
  'latitud',
  'longitud',
  'municipio',
  'provincia',
  'zona',
] as const

const OBLIGATORIAS = ['nombre', 'tipo', 'latitud', 'longitud', 'municipio', 'provincia'] as const

type Fila = Readonly<Record<(typeof COLUMNAS_CSV)[number], string>>
type ErrorFila = InformeImportacion['errores'][number]

/** Granja sin id: el id lo pone quien la guarda. */
export type GranjaNueva = Omit<Granja, 'id'>

export interface ResultadoCsv {
  readonly filasTotales: number
  readonly granjas: readonly GranjaNueva[]
  readonly errores: readonly ErrorFila[]
}

function esTipo(valor: string): valor is TipoGranja {
  return valor in ETIQUETA_TIPO_GRANJA
}

function numeroEnRango(valor: string, min: number, max: number): number | null {
  const n = Number(valor)
  return valor !== '' && Number.isFinite(n) && n >= min && n <= max ? n : null
}

/** Valida una fila. `numero` cuenta desde 1 sin la cabecera, como dirá el informe. */
function validarFila(fila: Fila, numero: number): GranjaNueva | ErrorFila {
  const falta = OBLIGATORIAS.find((campo) => !fila[campo])
  if (falta) return { fila: numero, campo: falta, mensaje: `Falta el campo ${falta}.` }
  if (!esTipo(fila.tipo)) {
    return { fila: numero, campo: 'tipo', mensaje: `Tipo de granja desconocido: «${fila.tipo}».` }
  }
  const latitud = numeroEnRango(fila.latitud, -90, 90)
  if (latitud === null) return { fila: numero, campo: 'latitud', mensaje: 'Latitud no válida.' }
  const longitud = numeroEnRango(fila.longitud, -180, 180)
  if (longitud === null) return { fila: numero, campo: 'longitud', mensaje: 'Longitud no válida.' }
  return {
    nombre: fila.nombre,
    tipo: fila.tipo,
    coordenadas: { latitud, longitud },
    estado_actual: 'sin_incidencias',
    codigo_rega: fila.codigo_rega || null,
    municipio: fila.municipio,
    provincia: fila.provincia,
    zona: fila.zona || null,
    enfermedad_actual: null,
  }
}

function aFila(cabecera: readonly string[], linea: string): Fila {
  const valores = linea.split(',').map((v) => v.trim())
  return Object.fromEntries(
    COLUMNAS_CSV.map((columna) => [columna, valores[cabecera.indexOf(columna)] ?? '']),
  ) as Fila
}

export function leerCsvGranjas(texto: string): ResultadoCsv {
  const [primera = '', ...resto] = texto.split(/\r?\n/)
  const lineas = resto.filter((l) => l.trim() !== '')
  const cabecera = primera.split(',').map((c) => c.trim().toLowerCase())
  const faltan = OBLIGATORIAS.filter((c) => !cabecera.includes(c))
  if (faltan.length > 0) {
    const mensaje = `Faltan columnas en la cabecera: ${faltan.join(', ')}.`
    return {
      filasTotales: lineas.length,
      granjas: [],
      errores: [{ fila: 0, campo: null, mensaje }],
    }
  }

  const resultados = lineas.map((linea, i) => validarFila(aFila(cabecera, linea), i + 1))
  return {
    filasTotales: lineas.length,
    granjas: resultados.filter((r): r is GranjaNueva => !('fila' in r)),
    errores: resultados.filter((r): r is ErrorFila => 'fila' in r),
  }
}
