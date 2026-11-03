import { http, HttpResponse } from 'msw/http'
import type {
  ApiError,
  Estado,
  Granja,
  Health,
  LoginRequest,
  PaginaGranjas,
  Regla,
  TipoGranja,
  Token,
  Usuario,
} from '../api/types'
import { API_URL } from '../config'
import { normalizar } from '../lib/texto'
import { GRANJAS, REGLAS, TOKEN_DEMO, USUARIO_DEMO } from './fixtures'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 25
const MAX_LIMIT = 100

function apiError(status: number, codigo: string, mensaje: string) {
  return HttpResponse.json<ApiError>({ codigo, mensaje }, { status })
}

function noAutorizado() {
  return apiError(401, 'no_autorizado', 'Tienes que iniciar sesión.')
}

function tieneToken(request: Request): boolean {
  return request.headers.get('Authorization') === `Bearer ${TOKEN_DEMO}`
}

function tokenDemo() {
  return HttpResponse.json<Token>({ access_token: TOKEN_DEMO, token_type: 'bearer' })
}

function entero(raw: string | null, porDefecto: number): number {
  const value = Number(raw)
  return Number.isInteger(value) && value >= 1 ? value : porDefecto
}

/** Aplica los filtros de GET /granjas. Sin filtros devuelve todas. */
export function filtrarGranjas(granjas: readonly Granja[], params: URLSearchParams): Granja[] {
  const tipo = params.get('tipo') as TipoGranja | null
  const estado = params.get('estado') as Estado | null
  const zona = params.get('zona')
  const q = normalizar(params.get('q') ?? '')
  return granjas.filter(
    (g) =>
      (!tipo || g.tipo === tipo) &&
      (!estado || g.estado_actual === estado) &&
      (!zona || g.zona === zona) &&
      (!q ||
        [g.nombre, g.municipio, g.codigo_rega ?? ''].some((campo) =>
          normalizar(campo).includes(q),
        )),
  )
}

/** Handlers de MSW tipados con los esquemas del contrato (docs/openapi.json). */
export const handlers = [
  http.get<never, never, Health>(`${API_URL}/health`, () =>
    HttpResponse.json({ estado: 'ok', version: 'mock' }),
  ),

  http.post<never, never, Token | ApiError>(`${API_URL}/auth/demo`, () => tokenDemo()),

  http.post<never, LoginRequest, Token | ApiError>(`${API_URL}/auth/login`, async ({ request }) => {
    const body: unknown = await request.json().catch(() => null)
    const { email, password } = (body ?? {}) as Partial<LoginRequest>
    if (typeof email !== 'string' || typeof password !== 'string' || !password) {
      return apiError(422, 'validacion', 'Faltan el email o la contraseña.')
    }
    return email === USUARIO_DEMO.email
      ? tokenDemo()
      : apiError(401, 'credenciales_invalidas', 'Email o contraseña incorrectos.')
  }),

  http.get<never, never, Usuario | ApiError>(`${API_URL}/auth/me`, ({ request }) =>
    tieneToken(request) ? HttpResponse.json(USUARIO_DEMO) : noAutorizado(),
  ),

  http.get<never, never, PaginaGranjas | ApiError>(`${API_URL}/granjas`, ({ request }) => {
    if (!tieneToken(request)) return noAutorizado()
    const params = new URL(request.url).searchParams
    const page = entero(params.get('page'), DEFAULT_PAGE)
    const limit = Math.min(entero(params.get('limit'), DEFAULT_LIMIT), MAX_LIMIT)
    const filtradas = filtrarGranjas(GRANJAS, params)
    const items = filtradas.slice((page - 1) * limit, page * limit)
    return HttpResponse.json({ items, total: filtradas.length, page, limit })
  }),

  http.get<{ granjaId: string }, never, Granja | ApiError>(
    `${API_URL}/granjas/:granjaId`,
    ({ request, params }) => {
      if (!tieneToken(request)) return noAutorizado()
      const granja = GRANJAS.find((g) => g.id === Number(params.granjaId))
      return granja
        ? HttpResponse.json(granja)
        : apiError(404, 'no_encontrado', `No existe la granja ${params.granjaId}.`)
    },
  ),

  http.get<never, never, Regla[] | ApiError>(`${API_URL}/reglas`, ({ request }) =>
    tieneToken(request) ? HttpResponse.json([...REGLAS]) : noAutorizado(),
  ),
]
