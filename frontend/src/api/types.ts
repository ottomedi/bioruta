import type { components } from './schema'

/**
 * Atajos a los esquemas del contrato. `schema.d.ts` se genera con
 * `pnpm gen:api` desde docs/openapi.json: si cambia un campo, el frontend no compila.
 */
type Schemas = components['schemas']

export type ApiError = Schemas['Error']
export type Enfermedad = Schemas['Enfermedad']
export type Estado = Schemas['Estado']
export type EstadoSanitario = Schemas['EstadoSanitario']
export type Granja = Schemas['Granja']
export type GranjaResumen = Schemas['GranjaResumen']
export type Health = Schemas['Health']
export type InformeImportacion = Schemas['InformeImportacion']
export type LoginRequest = Schemas['LoginRequest']
export type Medida = Schemas['Medida']
export type OrigenEstado = Schemas['OrigenEstado']
export type PaginaGranjas = Schemas['PaginaGranjas']
export type PaginaVisitas = Schemas['PaginaVisitas']
export type Regla = Schemas['Regla']
export type TipoGranja = Schemas['TipoGranja']
export type TipoRegla = Schemas['TipoRegla']
export type Token = Schemas['Token']
export type Usuario = Schemas['Usuario']
export type Visita = Schemas['Visita']

/** Qué se importa en POST /import. */
export type EntidadImportacion = InformeImportacion['entidad']
