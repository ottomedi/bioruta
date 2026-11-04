/** El contrato manda las fechas en UTC y la app las enseña en hora de Madrid. */
const ZONA = 'Europe/Madrid'

const FECHA_HORA = new Intl.DateTimeFormat('es-ES', {
  timeZone: ZONA,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatearFechaHora(iso: string): string {
  return FECHA_HORA.format(new Date(iso))
}

// en-CA da el formato AAAA-MM-DD que pide el contrato para las fechas.
const DIA_ISO = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** El día de hoy en Madrid, como lo pide el contrato (`2026-11-04`). */
export function hoyEnMadrid(ahora: Date = new Date()): string {
  return DIA_ISO.format(ahora)
}
