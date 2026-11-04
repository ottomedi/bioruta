import { BookOpen, Lightbulb, Scale, type LucideIcon } from 'lucide-react'
import type { TipoRegla } from '../../api/types'
import { ETIQUETA_TIPO_REGLA } from '../../domain/etiquetas'

/** No usa los colores de riesgo: aquí no se habla de peligro, sino de cuánto respaldo tiene la regla. */
const ESTILO: Readonly<Record<TipoRegla, { clases: string; icono: LucideIcon }>> = {
  normativa: { clases: 'border-campo bg-campo text-white', icono: Scale },
  guia: { clases: 'border-campo bg-campo-suave text-campo', icono: BookOpen },
  supuesto: { clases: 'border-linea bg-fondo text-tinta-suave border-dashed', icono: Lightbulb },
}

export function TipoReglaBadge({ tipo }: { readonly tipo: TipoRegla }) {
  const { clases, icono: Icono } = ESTILO[tipo]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-sm font-semibold whitespace-nowrap ${clases}`}
    >
      <Icono aria-hidden className="size-4" />
      {ETIQUETA_TIPO_REGLA[tipo]}
    </span>
  )
}
