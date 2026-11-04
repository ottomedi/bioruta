import type { EstadoSanitario, Granja, GranjaResumen, Usuario, Visita } from '../api/types'

/**
 * Datos falsos para trabajar sin backend. Las granjas están en La Litera
 * (Huesca), una comarca con mucho porcino, y cubren todos los estados y varios
 * tipos. Los nombres y códigos REGA son inventados.
 */

export const USUARIO_DEMO: Usuario = {
  id: 1,
  email: 'demo@bioruta.es',
  veterinario: { id: 1, nombre: 'Laura Gil', base: { latitud: 41.8517, longitud: 0.2946 } },
}

/** Token falso que devuelven los mocks de /auth. */
export const TOKEN_DEMO = 'token-de-demo'

export const GRANJAS: readonly Granja[] = [
  {
    id: 1,
    nombre: 'Granja El Pinar',
    tipo: 'nucleo_genetico',
    coordenadas: { latitud: 41.8712, longitud: 0.3104 },
    estado_actual: 'sin_incidencias',
    codigo_rega: 'ES220000000001',
    municipio: 'Binéfar',
    provincia: 'Huesca',
    zona: 'La Litera',
    enfermedad_actual: null,
  },
  {
    id: 2,
    nombre: 'Porcino Las Eras',
    tipo: 'multiplicacion',
    coordenadas: { latitud: 41.8305, longitud: 0.3421 },
    estado_actual: 'sin_incidencias',
    codigo_rega: 'ES220000000002',
    municipio: 'Esplús',
    provincia: 'Huesca',
    zona: 'La Litera',
    enfermedad_actual: null,
  },
  {
    id: 3,
    nombre: 'Explotación San Roque',
    tipo: 'maternidad',
    coordenadas: { latitud: 41.8941, longitud: 0.2533 },
    estado_actual: 'zona_vigilancia',
    codigo_rega: 'ES220000000003',
    municipio: 'San Esteban de Litera',
    provincia: 'Huesca',
    zona: 'La Litera',
    enfermedad_actual: null,
  },
  {
    id: 4,
    nombre: 'Cebadero La Clamor',
    tipo: 'cebo',
    coordenadas: { latitud: 41.8102, longitud: 0.2789 },
    estado_actual: 'sospechosa',
    codigo_rega: 'ES220000000004',
    municipio: 'Altorricón',
    provincia: 'Huesca',
    zona: 'La Litera',
    enfermedad_actual: 'prrs',
  },
  {
    id: 5,
    nombre: 'Granja Valcarca',
    tipo: 'transicion',
    coordenadas: { latitud: 41.8623, longitud: 0.2217 },
    estado_actual: 'sin_incidencias',
    codigo_rega: null,
    municipio: 'Tamarite de Litera',
    provincia: 'Huesca',
    zona: 'La Litera',
    enfermedad_actual: null,
  },
  {
    id: 6,
    nombre: 'Cebo Los Almendros',
    tipo: 'cebo',
    coordenadas: { latitud: 41.7884, longitud: 0.3307 },
    estado_actual: 'positiva',
    codigo_rega: 'ES220000000006',
    municipio: 'Albelda',
    provincia: 'Huesca',
    zona: 'La Litera',
    enfermedad_actual: 'ppa',
  },
]

/**
 * Historial sanitario. El estado vigente (sin `hasta`) coincide con el
 * `estado_actual` de cada granja; las que han cambiado tienen su estado anterior.
 */
export const ESTADOS: readonly EstadoSanitario[] = [
  {
    id: 1,
    granja_id: 1,
    estado: 'sin_incidencias',
    enfermedad: null,
    desde: '2026-01-10T08:00:00Z',
    hasta: null,
    origen: 'seed',
  },
  {
    id: 2,
    granja_id: 2,
    estado: 'sin_incidencias',
    enfermedad: null,
    desde: '2026-01-10T08:00:00Z',
    hasta: null,
    origen: 'seed',
  },
  {
    id: 3,
    granja_id: 3,
    estado: 'sin_incidencias',
    enfermedad: null,
    desde: '2026-01-10T08:00:00Z',
    hasta: '2026-10-28T09:00:00Z',
    origen: 'seed',
  },
  {
    id: 4,
    granja_id: 3,
    estado: 'zona_vigilancia',
    enfermedad: null,
    desde: '2026-10-28T09:00:00Z',
    hasta: null,
    origen: 'seed',
  },
  {
    id: 5,
    granja_id: 4,
    estado: 'sin_incidencias',
    enfermedad: null,
    desde: '2026-01-10T08:00:00Z',
    hasta: '2026-10-30T11:30:00Z',
    origen: 'seed',
  },
  {
    id: 6,
    granja_id: 4,
    estado: 'sospechosa',
    enfermedad: 'prrs',
    desde: '2026-10-30T11:30:00Z',
    hasta: null,
    origen: 'seed',
  },
  {
    id: 7,
    granja_id: 5,
    estado: 'sin_incidencias',
    enfermedad: null,
    desde: '2026-01-10T08:00:00Z',
    hasta: null,
    origen: 'seed',
  },
  {
    id: 8,
    granja_id: 6,
    estado: 'sin_incidencias',
    enfermedad: null,
    desde: '2026-01-10T08:00:00Z',
    hasta: '2026-10-25T07:45:00Z',
    origen: 'seed',
  },
  {
    id: 9,
    granja_id: 6,
    estado: 'sospechosa',
    enfermedad: 'ppa',
    desde: '2026-10-25T07:45:00Z',
    hasta: '2026-10-27T16:00:00Z',
    origen: 'seed',
  },
  {
    id: 10,
    granja_id: 6,
    estado: 'positiva',
    enfermedad: 'ppa',
    desde: '2026-10-27T16:00:00Z',
    hasta: null,
    origen: 'seed',
  },
]

function resumen(id: number): GranjaResumen {
  const granja = GRANJAS.find((g) => g.id === id)
  if (!granja) throw new Error(`No hay granja ${id} en los fixtures.`)
  const { nombre, tipo, coordenadas, estado_actual } = granja
  return { id, nombre, tipo, coordenadas, estado_actual }
}

/** Visitas de la veterinaria de demo, de la más reciente a la más antigua. */
export const VISITAS: readonly Visita[] = [
  {
    id: 6,
    veterinario_id: 1,
    granja: resumen(1),
    entrada: '2026-11-02T08:15:00Z',
    salida: '2026-11-02T09:40:00Z',
    medidas: ['ducha', 'cambio_ropa', 'desinfeccion_calzado'],
    parada_id: null,
    estado_granja_en_visita: 'sin_incidencias',
  },
  {
    id: 5,
    veterinario_id: 1,
    granja: resumen(4),
    entrada: '2026-10-31T10:00:00Z',
    salida: '2026-10-31T11:20:00Z',
    medidas: ['ducha', 'cambio_ropa'],
    parada_id: null,
    estado_granja_en_visita: 'sospechosa',
  },
  {
    id: 4,
    veterinario_id: 1,
    granja: resumen(3),
    entrada: '2026-10-30T08:30:00Z',
    salida: '2026-10-30T09:15:00Z',
    medidas: ['desinfeccion_calzado'],
    parada_id: null,
    estado_granja_en_visita: 'zona_vigilancia',
  },
  {
    id: 3,
    veterinario_id: 1,
    granja: resumen(1),
    entrada: '2026-10-26T08:00:00Z',
    salida: '2026-10-26T09:10:00Z',
    medidas: ['ducha', 'cambio_ropa', 'desinfeccion_calzado'],
    parada_id: null,
    estado_granja_en_visita: 'sin_incidencias',
  },
  {
    id: 2,
    veterinario_id: 1,
    granja: resumen(6),
    entrada: '2026-10-24T12:00:00Z',
    salida: '2026-10-24T13:30:00Z',
    medidas: [],
    parada_id: null,
    estado_granja_en_visita: 'sin_incidencias',
  },
  {
    id: 1,
    veterinario_id: 1,
    granja: resumen(2),
    entrada: '2026-10-22T09:00:00Z',
    salida: '2026-10-22T10:05:00Z',
    medidas: ['ducha'],
    parada_id: null,
    estado_granja_en_visita: 'sin_incidencias',
  },
]
