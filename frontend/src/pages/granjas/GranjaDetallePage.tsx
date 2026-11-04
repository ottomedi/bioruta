import { ArrowLeft, SearchX } from 'lucide-react'
import { useCallback } from 'react'
import { Link, useParams } from 'react-router'
import { ApiRequestError } from '../../api/client'
import { obtenerGranja } from '../../api/granjas'
import type { Granja } from '../../api/types'
import { useAuth } from '../../auth/authContext'
import { Card } from '../../components/ui/Card'
import { Crotal } from '../../components/ui/Crotal'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorCarga } from '../../components/ui/ErrorCarga'
import { EstadoBadge } from '../../components/ui/RiskBadge'
import { Spinner } from '../../components/ui/Spinner'
import { ETIQUETA_ENFERMEDAD } from '../../domain/etiquetas'
import { ETIQUETA_TIPO_GRANJA } from '../../domain/riesgo'
import { useCarga } from '../../lib/useCarga'
import { HistorialSanitario } from './HistorialSanitario'
import { UltimasVisitas } from './UltimasVisitas'

const HTTP_NOT_FOUND = 404

/** El id de la URL, o null si no es un entero positivo. */
function leerId(raw: string | undefined): number | null {
  const id = Number(raw)
  return Number.isInteger(id) && id >= 1 ? id : null
}

function VolverALista() {
  return (
    <Link
      to="/granjas"
      className="inline-flex min-h-tactil items-center gap-1 self-start font-medium text-campo underline-offset-4 hover:underline"
    >
      <ArrowLeft aria-hidden className="size-5" /> Granjas
    </Link>
  )
}

function NoExiste() {
  return (
    <div className="flex flex-col gap-4">
      <title>Granja no encontrada · BioRuta</title>
      <VolverALista />
      <h1 className="sr-only">Granja no encontrada</h1>
      <EmptyState
        icon={SearchX}
        title="Esta granja no existe"
        description="Puede que el enlace esté mal o que la granja se haya quitado de los datos."
      />
    </div>
  )
}

export function GranjaDetallePage() {
  const id = leerId(useParams().id)
  if (id === null) return <NoExiste />
  // Con key, al pasar de una granja a otra se monta de cero y no se mezclan datos.
  return <FichaGranja key={id} id={id} />
}

function FichaGranja({ id }: { readonly id: number }) {
  const { request } = useAuth()
  const cargar = useCallback(
    (signal: AbortSignal) => obtenerGranja(request, id, signal),
    [request, id],
  )
  const [estado, reintentar] = useCarga(cargar)

  if (estado.kind === 'cargando') {
    return (
      <div className="flex flex-col gap-4">
        <VolverALista />
        <Spinner label="Cargando granja…" className="size-8" />
      </div>
    )
  }

  const noExiste =
    estado.kind === 'error' &&
    estado.error instanceof ApiRequestError &&
    estado.error.status === HTTP_NOT_FOUND
  if (noExiste) return <NoExiste />

  if (estado.kind === 'error') {
    return (
      <div className="flex flex-col gap-4">
        <VolverALista />
        <h1 className="text-3xl font-bold tracking-tight">Granja {id}</h1>
        <ErrorCarga
          titulo="No se ha podido cargar la granja"
          mensaje={estado.mensaje}
          onReintentar={reintentar}
        />
      </div>
    )
  }

  return <Ficha granja={estado.datos} />
}

function Ficha({ granja }: { readonly granja: Granja }) {
  return (
    <div className="flex flex-col gap-5">
      <title>{`${granja.nombre} · BioRuta`}</title>
      <VolverALista />
      <header className="flex flex-wrap items-center gap-3">
        <Crotal tamano="lg" label={`Granja ${granja.id}`}>
          {String(granja.id).padStart(2, '0')}
        </Crotal>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{granja.nombre}</h1>
          <p className="flex flex-wrap items-center gap-2 text-lg text-tinta-suave">
            {ETIQUETA_TIPO_GRANJA[granja.tipo]} · {granja.municipio}
            <EstadoBadge estado={granja.estado_actual} />
            {granja.enfermedad_actual && (
              <span className="font-semibold text-tinta">
                {ETIQUETA_ENFERMEDAD[granja.enfermedad_actual]}
              </span>
            )}
          </p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <DatosGranja granja={granja} />
        <HistorialSanitario granjaId={granja.id} />
        <div className="lg:col-span-2">
          <UltimasVisitas granjaId={granja.id} />
        </div>
      </div>
    </div>
  )
}

const COORDENADA = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 4 })

function DatosGranja({ granja }: { readonly granja: Granja }) {
  const { latitud, longitud } = granja.coordenadas
  const filas: readonly [string, string][] = [
    ['Tipo', ETIQUETA_TIPO_GRANJA[granja.tipo]],
    ['Código REGA', granja.codigo_rega ?? 'Sin código'],
    ['Municipio', granja.municipio],
    ['Provincia', granja.provincia],
    ['Zona', granja.zona ?? 'Sin zona'],
    ['Coordenadas', `${COORDENADA.format(latitud)}, ${COORDENADA.format(longitud)}`],
  ]
  return (
    <Card title="Datos">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
        {filas.map(([termino, valor]) => (
          <div key={termino} className="contents">
            <dt className="text-tinta-suave">{termino}</dt>
            <dd className="font-medium">{valor}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
