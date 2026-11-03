import type { Granja, Regla, Usuario } from '../api/types'

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

/** Las filas de docs/reglas.md. Hasta que tengan fuente, todas son supuestos. */
export const REGLAS: readonly Regla[] = [
  ['R01', 'Orden de visita según estado sanitario'],
  ['R02', 'Horas de vacío tras visitar una granja positiva o sospechosa'],
  ['R03', 'Reducción de riesgo por cada medida (ducha, cambio de ropa, calzado)'],
  ['R04', 'Sensibilidad por tipo de granja'],
  ['R05', 'Riesgo que emite cada estado sanitario'],
  ['R06', 'Cómo baja el riesgo con el tiempo desde la salida'],
  ['R07', 'Umbral de riesgo para entrar en una granja de sensibilidad alta'],
  ['R08', 'Pesos α y β de la función de coste'],
  ['R09', 'Ventana de trazabilidad'],
  ['R10', 'Estado de una granja con varios estados vigentes'],
].map(([id, descripcion]) => ({
  id,
  descripcion,
  valor: 'por fijar',
  fuente: null,
  url: null,
  cita: null,
  tipo: 'supuesto',
}))
