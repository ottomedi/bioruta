import type { NivelRiesgo } from '../../domain/riesgo'

interface KpiCardProps {
  readonly label: string
  readonly value: string | number
  readonly unit?: string
  /** Una línea debajo del número, por ejemplo «+3,2 km respecto a la más corta». */
  readonly detail?: string
  /** Colorea el borde izquierdo. Sin tono, la tarjeta es neutra. */
  readonly tono?: NivelRiesgo
}

const BORDE_TONO: Readonly<Record<NivelRiesgo, string>> = {
  alto: 'border-l-riesgo-alto',
  medio: 'border-l-riesgo-medio',
  bajo: 'border-l-riesgo-bajo',
  sin_datos: 'border-l-riesgo-sin-datos',
}

export function KpiCard({ label, value, unit, detail, tono }: KpiCardProps) {
  const borde = tono ? BORDE_TONO[tono] : 'border-l-slate-300'
  return (
    <div className={`rounded-xl border border-l-4 border-slate-200 bg-white p-4 ${borde}`}>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">
        {value}
        {unit && <span className="ml-1 text-lg font-semibold text-slate-600">{unit}</span>}
      </p>
      {detail && <p className="mt-1 text-sm text-slate-600">{detail}</p>}
    </div>
  )
}
