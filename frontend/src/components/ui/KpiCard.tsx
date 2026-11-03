import type { NivelRiesgo } from '../../domain/riesgo'

interface KpiCardProps {
  readonly label: string
  readonly value: string | number
  readonly unit?: string
  /** Una línea debajo del número, por ejemplo «+3,2 km respecto a la más corta». */
  readonly detail?: string
  /** Colorea el número y el punto de estado. Sin tono, la tarjeta es neutra. */
  readonly tono?: NivelRiesgo
}

const COLOR_TONO: Readonly<Record<NivelRiesgo, { numero: string; punto: string }>> = {
  alto: { numero: 'text-riesgo-alto', punto: 'bg-riesgo-alto' },
  medio: { numero: 'text-riesgo-medio', punto: 'bg-riesgo-medio-fuerte' },
  bajo: { numero: 'text-riesgo-bajo', punto: 'bg-riesgo-bajo' },
  sin_datos: { numero: 'text-riesgo-sin-datos', punto: 'bg-riesgo-sin-datos' },
}

export function KpiCard({ label, value, unit, detail, tono }: KpiCardProps) {
  const color = tono ? COLOR_TONO[tono] : null
  return (
    <div className="rounded-lg border border-linea bg-superficie p-4 shadow-tarjeta">
      <p className="flex items-center gap-2 text-sm font-medium text-tinta-suave">
        {color && <span aria-hidden className={`size-2.5 rounded-full ${color.punto}`} />}
        {label}
      </p>
      <p
        className={`mt-1 font-crotal text-4xl leading-none font-bold ${color?.numero ?? 'text-tinta'}`}
      >
        {value}
        {unit && (
          <span className="ml-1 font-sans text-lg font-semibold text-tinta-suave">{unit}</span>
        )}
      </p>
      {detail && <p className="mt-2 text-sm text-tinta-suave">{detail}</p>}
    </div>
  )
}
