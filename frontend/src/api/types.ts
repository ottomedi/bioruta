import type { components } from './schema'

/**
 * Atajos a los esquemas del contrato. `schema.d.ts` se genera con
 * `pnpm gen:api` desde docs/openapi.json: si cambia un campo, el frontend no compila.
 */
type Schemas = components['schemas']

export type ApiError = Schemas['Error']
export type Estado = Schemas['Estado']
export type Granja = Schemas['Granja']
export type Health = Schemas['Health']
export type LoginRequest = Schemas['LoginRequest']
export type PaginaGranjas = Schemas['PaginaGranjas']
export type Regla = Schemas['Regla']
export type TipoGranja = Schemas['TipoGranja']
export type Token = Schemas['Token']
export type Usuario = Schemas['Usuario']
