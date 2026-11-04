import { http, HttpResponse } from 'msw/http'
import type {
  ApiError,
  Estado,
  EstadoSanitario,
  Granja,
  Health,
  InformeImportacion,
  LoginRequest,
  PaginaGranjas,
  PaginaVisitas,
  Regla,
  TipoGranja,
  Token,
  Usuario,
} from '../api/types'
import { API_URL } from '../config'
import { normalizar } from '../lib/texto'
import { granjasGuardadas, guardarGranjas } from './almacen'
import { ESTADOS, TOKEN_DEMO, USUARIO_DEMO, VISITAS } from './fixtures'
import { leerCsvGranjas } from './importarCsv'
import { REGLAS } from './reglas'

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

/** Recorta una lista a la página pedida, con los mismos límites que el contrato. */
function paginar<T>(lista: readonly T[], params: URLSearchParams) {
  const page = entero(params.get('page'), DEFAULT_PAGE)
  const limit = Math.min(entero(params.get('limit'), DEFAULT_LIMIT), MAX_LIMIT)
  return { items: lista.slice((page - 1) * limit, page * limit), total: lista.length, page, limit }
}

function noExisteGranja(id: string) {
  return apiError(404, 'no_encontrado', `No existe la granja ${id}.`)
}

async function importarGranjas(request: Request) {
  const formulario = await request.formData().catch(() => null)
  const fichero = formulario?.get('fichero')
  const entidad = formulario?.get('entidad')
  // Sin instanceof File: en los tests (jsdom) el File del formulario es de otra clase.
  if (!fichero || typeof fichero === 'string') {
    return apiError(422, 'validacion', 'Falta el fichero.')
  }
  if (entidad !== 'granjas') {
    return apiError(422, 'validacion', 'Los mocks solo saben importar granjas.')
  }
  // Un nombre sin extensión se acepta: en jsdom el fichero llega como «blob» al pasar por fetch.
  const extension = /\.([^.]+)$/.exec(fichero.name)?.[1]?.toLowerCase()
  if (extension && extension !== 'csv') {
    return apiError(422, 'validacion', 'Los mocks solo leen ficheros CSV.')
  }
  const { filasTotales, granjas, errores } = leerCsvGranjas(await fichero.text())
  const { creadas, actualizadas } = guardarGranjas(granjas)
  return HttpResponse.json<InformeImportacion>({
    entidad: 'granjas',
    adaptador: 'csv',
    filas_totales: filasTotales,
    creadas,
    actualizadas,
    errores: [...errores],
  })
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
    return HttpResponse.json(paginar(filtrarGranjas(granjasGuardadas(), params), params))
  }),

  http.get<{ granjaId: string }, never, Granja | ApiError>(
    `${API_URL}/granjas/:granjaId`,
    ({ request, params }) => {
      if (!tieneToken(request)) return noAutorizado()
      const granja = granjasGuardadas().find((g) => g.id === Number(params.granjaId))
      return granja ? HttpResponse.json(granja) : noExisteGranja(params.granjaId)
    },
  ),

  http.get<{ granjaId: string }, never, EstadoSanitario[] | ApiError>(
    `${API_URL}/granjas/:granjaId/estados`,
    ({ request, params }) => {
      if (!tieneToken(request)) return noAutorizado()
      const id = Number(params.granjaId)
      if (!granjasGuardadas().some((g) => g.id === id)) return noExisteGranja(params.granjaId)
      return HttpResponse.json(ESTADOS.filter((e) => e.granja_id === id))
    },
  ),

  http.get<never, never, string[] | ApiError>(`${API_URL}/zonas`, ({ request }) => {
    if (!tieneToken(request)) return noAutorizado()
    const zonas = new Set(granjasGuardadas().flatMap((g) => (g.zona ? [g.zona] : [])))
    return HttpResponse.json([...zonas].sort((a, b) => a.localeCompare(b, 'es')))
  }),

  http.get<never, never, PaginaVisitas | ApiError>(`${API_URL}/visitas`, ({ request }) => {
    if (!tieneToken(request)) return noAutorizado()
    const params = new URL(request.url).searchParams
    const granjaId = params.get('granja_id')
    const visitas = granjaId ? VISITAS.filter((v) => v.granja.id === Number(granjaId)) : VISITAS
    return HttpResponse.json(paginar(visitas, params))
  }),

  http.post<never, never, InformeImportacion | ApiError>(`${API_URL}/import`, ({ request }) =>
    tieneToken(request) ? importarGranjas(request) : noAutorizado(),
  ),

  http.get<never, never, Regla[] | ApiError>(`${API_URL}/reglas`, ({ request }) =>
    tieneToken(request) ? HttpResponse.json([...REGLAS]) : noAutorizado(),
  ),
]
