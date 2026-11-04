import { useCallback } from 'react'
import type { Visita } from '../../api/types'
import { listarVisitas } from '../../api/visitas'
import { useAuth } from '../../auth/authContext'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorCarga } from '../../components/ui/ErrorCarga'
import { EstadoBadge } from '../../components/ui/RiskBadge'
import { Spinner } from '../../components/ui/Spinner'
import { ETIQUETA_MEDIDA } from '../../domain/etiquetas'
import { formatearFechaHora } from '../../lib/fecha'
import { useCarga } from '../../lib/useCarga'

/** Cuántas visitas se enseñan en la ficha. */
export const VISITAS_EN_FICHA = 5

export function UltimasVisitas({ granjaId }: { readonly granjaId: number }) {
  const { request } = useAuth()
  const cargar = useCallback(
    (signal: AbortSignal) =>
      listarVisitas(request, { granja_id: granjaId, limit: VISITAS_EN_FICHA }, signal),
    [request, granjaId],
  )
  const [estado, reintentar] = useCarga(cargar)

  return (
    <Card title="Últimas visitas">
      {estado.kind === 'cargando' && <Spinner label="Cargando visitas…" />}
      {estado.kind === 'error' && (
        <ErrorCarga
          titulo="No se han podido cargar las visitas"
          mensaje={estado.mensaje}
          onReintentar={reintentar}
        />
      )}
      {estado.kind === 'ok' && estado.datos.items.length === 0 && (
        <EmptyState title="Nadie ha visitado esta granja todavía" />
      )}
      {estado.kind === 'ok' && estado.datos.items.length > 0 && (
        <>
          <ul className="flex flex-col">
            {estado.datos.items.map((v) => (
              <FilaVisita key={v.id} visita={v} />
            ))}
          </ul>
          {estado.datos.total > estado.datos.items.length && (
            <p className="mt-3 text-sm text-tinta-suave">
              Se enseñan las {estado.datos.items.length} más recientes de {estado.datos.total}.
            </p>
          )}
        </>
      )}
    </Card>
  )
}

function FilaVisita({ visita }: { readonly visita: Visita }) {
  const medidas = visita.medidas.map((m) => ETIQUETA_MEDIDA[m]).join(', ')
  return (
    <li className="flex flex-col gap-1 border-t border-linea py-3 first:border-t-0 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div>
        <p className="font-medium">
          {formatearFechaHora(visita.entrada)}
          {visita.salida ? ` – ${formatearFechaHora(visita.salida)}` : ' · visita abierta'}
        </p>
        <p className="text-sm text-tinta-suave">
          {medidas ? `Medidas al salir: ${medidas}` : 'Sin medidas registradas al salir'}
        </p>
      </div>
      <p className="flex items-center gap-2 text-sm text-tinta-suave">
        Estado al entrar <EstadoBadge estado={visita.estado_granja_en_visita} />
      </p>
    </li>
  )
}
