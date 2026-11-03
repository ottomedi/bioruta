import { CircleHelp, OctagonAlert, ShieldCheck, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { Estado } from '../../api/types'
import {
  ETIQUETA_ESTADO,
  ETIQUETA_NIVEL,
  NIVEL_POR_ESTADO,
  type NivelRiesgo,
} from '../../domain/riesgo'

/** Cada nivel tiene su icono, para que se distinga sin ver el color. */
const ESTILO_NIVEL: Readonly<Record<NivelRiesgo, { clases: string; icono: LucideIcon }>> = {
  alto: {
    clases: 'border-riesgo-alto bg-riesgo-alto text-white',
    icono: OctagonAlert,
  },
  medio: {
    clases: 'border-riesgo-medio bg-riesgo-medio-suave text-riesgo-medio',
    icono: TriangleAlert,
  },
  bajo: { clases: 'border-riesgo-bajo bg-riesgo-bajo-suave text-riesgo-bajo', icono: ShieldCheck },
  sin_datos: {
    clases: 'border-riesgo-sin-datos bg-riesgo-sin-datos-suave text-riesgo-sin-datos',
    icono: CircleHelp,
  },
}

interface RiskBadgeProps {
  readonly nivel: NivelRiesgo
  /** Texto que se enseña. Por defecto, el nombre del nivel. */
  readonly label?: string
}

export function RiskBadge({ nivel, label = ETIQUETA_NIVEL[nivel] }: RiskBadgeProps) {
  const { clases, icono: Icono } = ESTILO_NIVEL[nivel]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-sm font-semibold whitespace-nowrap ${clases}`}
    >
      <Icono aria-hidden className="size-4" />
      {label}
    </span>
  )
}

/** El estado sanitario de una granja con el color de su nivel de riesgo. */
export function EstadoBadge({ estado }: { readonly estado: Estado }) {
  return <RiskBadge nivel={NIVEL_POR_ESTADO[estado]} label={ETIQUETA_ESTADO[estado]} />
}
