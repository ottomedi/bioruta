import type { Estado, TipoGranja } from '../api/types'

/**
 * Nivel visual de riesgo: decide el color y el icono. No es una regla del motor,
 * solo cómo se enseña cada estado; los números del motor están en risk_config.json.
 */
export type NivelRiesgo = 'alto' | 'medio' | 'bajo' | 'sin_datos'

export const NIVEL_POR_ESTADO: Readonly<Record<Estado, NivelRiesgo>> = {
  positiva: 'alto',
  sospechosa: 'medio',
  zona_vigilancia: 'medio',
  sin_incidencias: 'bajo',
}

export const ETIQUETA_NIVEL: Readonly<Record<NivelRiesgo, string>> = {
  alto: 'Riesgo alto',
  medio: 'Riesgo medio',
  bajo: 'Riesgo bajo',
  sin_datos: 'Sin datos',
}

export const ETIQUETA_ESTADO: Readonly<Record<Estado, string>> = {
  positiva: 'Positiva',
  sospechosa: 'Sospechosa',
  zona_vigilancia: 'Zona de vigilancia',
  sin_incidencias: 'Sin incidencias',
}

export const ETIQUETA_TIPO_GRANJA: Readonly<Record<TipoGranja, string>> = {
  nucleo_genetico: 'Núcleo genético',
  multiplicacion: 'Multiplicación',
  maternidad: 'Maternidad',
  ciclo_cerrado: 'Ciclo cerrado',
  transicion: 'Transición',
  cebo: 'Cebo',
}
