import { Route, ShieldCheck } from 'lucide-react'
import type { ComparacionRutas, CriterioRuta } from '../../api/types'

const KM = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 })

const OPCIONES: readonly { criterio: CriterioRuta; titulo: string; icono: typeof Route }[] = [
  { criterio: 'segura', titulo: 'Segura', icono: ShieldCheck },
  { criterio: 'mas_corta', titulo: 'Más corta', icono: Route },
]

function textoExposiciones(n: number): string {
  if (n === 0) return 'Sin exposiciones'
  return n === 1 ? '1 exposición' : `${n} exposiciones`
}

interface SelectorCriterioProps {
  readonly comparacion: ComparacionRutas
  readonly criterio: CriterioRuta
  readonly onCambiar: (criterio: CriterioRuta) => void
}

/** Las dos rutas una junto a otra, con sus km y exposiciones; la elegida se pinta en el mapa. */
export function SelectorCriterio({ comparacion, criterio, onCambiar }: SelectorCriterioProps) {
  return (
    <fieldset className="grid grid-cols-2 gap-2">
      <legend className="mb-2 font-semibold">Qué ruta ver</legend>
      {OPCIONES.map(({ criterio: valor, titulo, icono: Icono }) => {
        const ruta = valor === 'segura' ? comparacion.segura : comparacion.mas_corta
        const activa = valor === criterio
        return (
          <label
            key={valor}
            className={`flex cursor-pointer flex-col gap-0.5 rounded-lg border-2 p-3 transition-colors has-focus-visible:outline-3 has-focus-visible:outline-campo ${activa ? 'border-campo bg-campo-suave' : 'border-linea bg-superficie hover:border-campo/50'}`}
          >
            <input
              type="radio"
              name="criterio"
              value={valor}
              checked={activa}
              onChange={() => onCambiar(valor)}
              className="sr-only"
            />
            <span className="flex items-center gap-1.5 font-semibold">
              <Icono aria-hidden className="size-5 text-campo" /> {titulo}
            </span>
            <span className="text-2xl font-bold tracking-tight">
              {KM.format(ruta.km_total)} <span className="text-base font-medium">km</span>
            </span>
            <span
              className={`text-sm font-medium ${ruta.exposiciones > 0 ? 'text-riesgo-alto' : 'text-riesgo-bajo'}`}
            >
              {textoExposiciones(ruta.exposiciones)}
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}
