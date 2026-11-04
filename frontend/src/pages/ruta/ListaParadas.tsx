import { House, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router'
import type { RutaCalculada } from '../../api/types'
import { Crotal } from '../../components/ui/Crotal'
import { EstadoBadge } from '../../components/ui/RiskBadge'

/** Las paradas en orden, cada una con el porqué de su posición. */
export function ListaParadas({ ruta }: { readonly ruta: RutaCalculada }) {
  return (
    <ol aria-label="Paradas de la ruta" className="flex flex-col">
      <li className="flex items-center gap-3 pb-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-campo text-white">
          <House aria-hidden className="size-5" />
        </span>
        <span className="font-semibold">Salida desde tu base</span>
      </li>
      {ruta.paradas.map((parada) => (
        <li key={parada.orden} className="flex gap-3 border-t border-linea py-3">
          <Crotal label={`Parada ${parada.orden}`}>{parada.orden}</Crotal>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/granjas/${parada.granja.id}`}
                className="font-semibold text-campo underline-offset-4 hover:underline"
              >
                {parada.granja.nombre}
              </Link>
              <EstadoBadge estado={parada.granja.estado_actual} />
            </div>
            {parada.tramo_peligroso && (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-riesgo-alto">
                <TriangleAlert aria-hidden className="size-4 shrink-0" />
                Tramo con exposición
              </p>
            )}
            <p className="text-sm text-tinta-suave">
              {parada.explicacion}
              {parada.regla_id && (
                <>
                  {' '}
                  <Link
                    to={`/fuentes#${encodeURIComponent(parada.regla_id)}`}
                    className="font-medium text-campo underline"
                  >
                    Ver {parada.regla_id}
                  </Link>
                </>
              )}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
