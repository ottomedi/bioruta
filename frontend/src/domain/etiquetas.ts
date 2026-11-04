import type { EntidadImportacion, Enfermedad, Medida, OrigenEstado, TipoRegla } from '../api/types'

/** Textos de los enums del contrato que no tienen que ver con el riesgo (esos están en riesgo.ts). */

export const ETIQUETA_ENFERMEDAD: Readonly<Record<Enfermedad, string>> = {
  ppa: 'PPA',
  prrs: 'PRRS',
  otra: 'Otra',
}

export const ETIQUETA_MEDIDA: Readonly<Record<Medida, string>> = {
  ducha: 'Ducha',
  cambio_ropa: 'Cambio de ropa',
  desinfeccion_calzado: 'Desinfección de calzado',
}

export const ETIQUETA_ORIGEN: Readonly<Record<OrigenEstado, string>> = {
  importado: 'Importado',
  alerta: 'Alerta',
  seed: 'Datos de demo',
}

export const ETIQUETA_ENTIDAD: Readonly<Record<EntidadImportacion, string>> = {
  granjas: 'Granjas',
  visitas: 'Visitas',
  estados: 'Estados sanitarios',
}

/** De más a menos respaldo. */
export const ETIQUETA_TIPO_REGLA: Readonly<Record<TipoRegla, string>> = {
  normativa: 'Normativa',
  guia: 'Guía',
  supuesto: 'Supuesto',
}
