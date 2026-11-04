import { Upload } from 'lucide-react'
import { useCallback, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { listarGranjas } from '../../api/granjas'
import type { Estado, Granja } from '../../api/types'
import { useAuth } from '../../auth/authContext'
import { Crotal } from '../../components/ui/Crotal'
import { DataTable, type Columna } from '../../components/ui/DataTable'
import { ErrorCarga } from '../../components/ui/ErrorCarga'
import { Paginacion } from '../../components/ui/Paginacion'
import { EstadoBadge } from '../../components/ui/RiskBadge'
import { Spinner } from '../../components/ui/Spinner'
import { ETIQUETA_ENFERMEDAD } from '../../domain/etiquetas'
import { ETIQUETA_ESTADO, ETIQUETA_TIPO_GRANJA } from '../../domain/riesgo'
import { useCarga } from '../../lib/useCarga'
import { FiltrosGranjas } from './FiltrosGranjas'
import {
  CLAVES_FILTRO,
  conFiltro,
  conPagina,
  hayFiltros,
  leerFiltros,
  type ClaveFiltro,
} from './filtros'

// Las claves siguen el orden del contrato, de más a menos riesgo.
const ORDEN_ESTADO = Object.keys(ETIQUETA_ESTADO) as Estado[]

const COLUMNAS: readonly Columna<Granja>[] = [
  {
    key: 'id',
    header: 'Código',
    render: (g) => <Crotal label={`Granja ${g.id}`}>{String(g.id).padStart(2, '0')}</Crotal>,
    sortValue: (g) => g.id,
  },
  {
    key: 'nombre',
    header: 'Granja',
    render: (g) => (
      <Link
        to={`/granjas/${g.id}`}
        className="font-semibold text-campo underline-offset-4 hover:underline"
      >
        {g.nombre}
      </Link>
    ),
    sortValue: (g) => g.nombre,
  },
  {
    key: 'tipo',
    header: 'Tipo',
    render: (g) => ETIQUETA_TIPO_GRANJA[g.tipo],
    sortValue: (g) => ETIQUETA_TIPO_GRANJA[g.tipo],
  },
  {
    key: 'municipio',
    header: 'Municipio',
    render: (g) => g.municipio,
    sortValue: (g) => g.municipio,
  },
  { key: 'zona', header: 'Zona', render: (g) => g.zona ?? '—' },
  {
    key: 'estado',
    header: 'Estado',
    render: (g) => (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        <EstadoBadge estado={g.estado_actual} />
        {g.enfermedad_actual && (
          <span className="text-sm font-semibold">{ETIQUETA_ENFERMEDAD[g.enfermedad_actual]}</span>
        )}
      </span>
    ),
    sortValue: (g) => ORDEN_ESTADO.indexOf(g.estado_actual),
  },
]

function totalTexto(total: number): string {
  return total === 1 ? '1 granja' : `${total} granjas`
}

export function GranjasPage() {
  const { request } = useAuth()
  const [params, setParams] = useSearchParams()
  const clave = params.toString()
  // La clave de la URL fija los filtros: mientras no cambie, la carga es la misma.
  const filtros = useMemo(() => leerFiltros(new URLSearchParams(clave)), [clave])
  const cargar = useCallback(
    (signal: AbortSignal) => listarGranjas(request, filtros, signal),
    [request, filtros],
  )
  const [estado, reintentar] = useCarga(cargar)

  const valores = Object.fromEntries(CLAVES_FILTRO.map((c) => [c, params.get(c) ?? ''])) as Record<
    ClaveFiltro,
    string
  >
  const cambiarFiltro = useCallback(
    (c: ClaveFiltro, valor: string) => setParams((p) => conFiltro(p, c, valor), { replace: true }),
    [setParams],
  )
  const filtrado = hayFiltros(params)

  // Mientras llega una página nueva se sigue viendo la anterior: no parpadea ni se pierde el foco.
  const datos =
    estado.kind === 'ok' ? estado.datos : estado.kind === 'cargando' ? estado.previos : undefined
  const recargando = estado.kind === 'cargando' && datos !== undefined

  // Una página que ya no existe (enlace viejo, menos granjas tras importar) lleva a la última.
  const ultimaPagina =
    estado.kind === 'ok' ? Math.max(1, Math.ceil(estado.datos.total / estado.datos.limit)) : null
  const fueraDeRango = ultimaPagina !== null && (filtros.page ?? 1) > ultimaPagina
  useEffect(() => {
    if (fueraDeRango && ultimaPagina !== null) {
      setParams((p) => conPagina(p, ultimaPagina), { replace: true })
    }
  }, [fueraDeRango, ultimaPagina, setParams])

  return (
    <div className="flex flex-col gap-5">
      <title>Granjas · BioRuta</title>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Granjas</h1>
          <p className="mt-1 text-lg text-tinta-suave">
            {datos
              ? `${totalTexto(datos.total)}${filtrado ? ' con estos filtros' : ''}`
              : 'Lista con filtros y nivel de riesgo.'}
          </p>
        </div>
        <Link
          to="/granjas/importar"
          className="inline-flex min-h-tactil items-center gap-2 rounded-md border border-linea bg-superficie px-4 font-semibold hover:border-campo hover:bg-campo-suave"
        >
          <Upload aria-hidden className="size-5" /> Importar fichero
        </Link>
      </header>

      <FiltrosGranjas
        valores={valores}
        onCambiar={cambiarFiltro}
        onLimpiar={filtrado ? () => setParams({}, { replace: true }) : undefined}
      />

      {estado.kind === 'cargando' && !datos && (
        <Spinner label="Cargando granjas…" className="size-8" />
      )}
      {estado.kind === 'error' && (
        <ErrorCarga
          titulo="No se han podido cargar las granjas"
          mensaje={estado.mensaje}
          onReintentar={reintentar}
        />
      )}
      {datos && (
        <div
          aria-busy={recargando || undefined}
          className={`flex flex-col gap-3 transition-opacity ${recargando ? 'opacity-60' : ''}`}
        >
          {recargando && <Spinner label="Actualizando la lista…" />}
          <DataTable
            caption="Granjas"
            columns={COLUMNAS}
            rows={datos.items}
            getRowId={(g) => g.id}
            emptyMessage={
              filtrado ? 'Ninguna granja cumple estos filtros.' : 'Todavía no hay granjas.'
            }
          />
          <Paginacion
            page={datos.page}
            limit={datos.limit}
            total={datos.total}
            onCambiar={(page) => setParams((p) => conPagina(p, page))}
          />
        </div>
      )}
    </div>
  )
}
