import type { Granja } from '../../api/types'
import { Crotal } from '../../components/ui/Crotal'
import { EstadoBadge } from '../../components/ui/RiskBadge'
import { ETIQUETA_TIPO_GRANJA } from '../../domain/riesgo'

/** El contrato admite hasta 20 granjas por cálculo (límite de rendimiento del motor). */
export const MAX_GRANJAS_RUTA = 20

interface SelectorGranjasProps {
  readonly granjas: readonly Granja[]
  readonly seleccionadas: ReadonlySet<number>
  readonly onCambiar: (seleccionadas: ReadonlySet<number>) => void
  /** Mientras se calcula no se puede cambiar: el resultado sería de otra selección. */
  readonly disabled?: boolean
}

export function SelectorGranjas({
  granjas,
  seleccionadas,
  onCambiar,
  disabled = false,
}: SelectorGranjasProps) {
  const lleno = seleccionadas.size >= MAX_GRANJAS_RUTA

  function alternar(id: number) {
    const nuevas = new Set(seleccionadas)
    if (nuevas.has(id)) nuevas.delete(id)
    else nuevas.add(id)
    onCambiar(nuevas)
  }

  return (
    <fieldset disabled={disabled} className="flex flex-col gap-2">
      <legend className="sr-only">Granjas que visitas hoy</legend>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-tinta-suave" aria-live="polite">
          {seleccionadas.size} de {MAX_GRANJAS_RUTA} como máximo
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onCambiar(new Set(granjas.slice(0, MAX_GRANJAS_RUTA).map((g) => g.id)))}
            className="min-h-tactil rounded-md px-2 font-medium text-campo hover:bg-campo-suave"
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => onCambiar(new Set())}
            disabled={seleccionadas.size === 0}
            className="min-h-tactil rounded-md px-2 font-medium text-campo hover:bg-campo-suave disabled:opacity-50"
          >
            Ninguna
          </button>
        </div>
      </div>
      <ul className="flex flex-col divide-y divide-linea rounded-lg border border-linea bg-superficie">
        {granjas.map((granja) => {
          const marcada = seleccionadas.has(granja.id)
          return (
            <li key={granja.id}>
              <label
                className={`flex min-h-tactil cursor-pointer items-center gap-3 px-3 py-2 hover:bg-fondo ${!marcada && lleno ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={marcada}
                  disabled={!marcada && lleno}
                  onChange={() => alternar(granja.id)}
                  className="size-5 shrink-0"
                />
                <Crotal tamano="sm" label={`Granja ${granja.id}`}>
                  {String(granja.id).padStart(2, '0')}
                </Crotal>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-semibold">{granja.nombre}</span>
                  <span className="text-sm text-tinta-suave">
                    {ETIQUETA_TIPO_GRANJA[granja.tipo]} · {granja.municipio}
                  </span>
                </span>
                <EstadoBadge estado={granja.estado_actual} />
              </label>
            </li>
          )
        })}
      </ul>
    </fieldset>
  )
}
