import { useCallback } from 'react'
import { listarEstados } from '../../api/granjas'
import type { EstadoSanitario } from '../../api/types'
import { useAuth } from '../../auth/authContext'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorCarga } from '../../components/ui/ErrorCarga'
import { EstadoBadge } from '../../components/ui/RiskBadge'
import { Spinner } from '../../components/ui/Spinner'
import { ETIQUETA_ENFERMEDAD, ETIQUETA_ORIGEN } from '../../domain/etiquetas'
import { formatearFechaHora } from '../../lib/fecha'
import { useCarga } from '../../lib/useCarga'

/** Del más reciente al más antiguo, como lo devuelve el backend. */
export function HistorialSanitario({ granjaId }: { readonly granjaId: number }) {
  const { request } = useAuth()
  const cargar = useCallback(
    (signal: AbortSignal) => listarEstados(request, granjaId, signal),
    [request, granjaId],
  )
  const [estado, reintentar] = useCarga(cargar)

  return (
    <Card title="Historial sanitario">
      {estado.kind === 'cargando' && <Spinner label="Cargando historial…" />}
      {estado.kind === 'error' && (
        <ErrorCarga
          titulo="No se ha podido cargar el historial"
          mensaje={estado.mensaje}
          onReintentar={reintentar}
        />
      )}
      {estado.kind === 'ok' && estado.datos.length === 0 && (
        <EmptyState title="Sin estados registrados" />
      )}
      {estado.kind === 'ok' && estado.datos.length > 0 && (
        <ol className="flex flex-col">
          {estado.datos.map((e) => (
            <FilaEstado key={e.id} estado={e} />
          ))}
        </ol>
      )}
    </Card>
  )
}

function FilaEstado({ estado }: { readonly estado: EstadoSanitario }) {
  const vigente = estado.hasta === null || estado.hasta === undefined
  return (
    <li className="flex flex-col gap-1 border-t border-linea py-3 first:border-t-0 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-2">
        <EstadoBadge estado={estado.estado} />
        {estado.enfermedad && (
          <span className="font-semibold">{ETIQUETA_ENFERMEDAD[estado.enfermedad]}</span>
        )}
        {vigente && (
          <span className="rounded-sm bg-campo-suave px-1.5 text-sm font-semibold text-campo">
            Vigente
          </span>
        )}
      </div>
      <p className="text-sm text-tinta-suave">
        Desde {formatearFechaHora(estado.desde)}
        {estado.hasta ? ` hasta ${formatearFechaHora(estado.hasta)}` : ''} ·{' '}
        {ETIQUETA_ORIGEN[estado.origen]}
      </p>
    </li>
  )
}
