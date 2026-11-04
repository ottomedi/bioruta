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
