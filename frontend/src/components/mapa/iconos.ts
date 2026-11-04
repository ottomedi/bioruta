import { divIcon, type DivIcon } from 'leaflet'
import type { NivelRiesgo } from '../../domain/riesgo'

/**
 * Marcadores del mapa en HTML (Leaflet los pinta fuera de React). Cada nivel de
 * riesgo tiene su forma, igual que en RiskBadge, para que se distinga sin color:
 * octógono (alto), triángulo (medio), círculo con visto (bajo), círculo con
 * interrogación (sin datos). Los estilos están en index.css (.marcador).
 */
const FORMA: Readonly<Record<NivelRiesgo, string>> = {
  alto: '<polygon points="7,1 17,1 23,7 23,17 17,23 7,23 1,17 1,7"/><path d="M12 6v7M12 17v.5" class="marcador__trazo"/>',
  medio:
    '<polygon points="12,1.5 23,21.5 1,21.5" stroke-linejoin="round"/><path d="M12 8v6M12 17.5v.5" class="marcador__trazo"/>',
  bajo: '<circle cx="12" cy="12" r="11"/><path d="M7 12.5l3.2 3.2L17 9" class="marcador__trazo"/>',
  sin_datos:
    '<circle cx="12" cy="12" r="11"/><path d="M9.2 9.3a2.9 2.9 0 1 1 3.8 2.8c-.6.3-1 .8-1 1.5v.6M12 17.5v.5" class="marcador__trazo"/>',
}

function forma(nivel: NivelRiesgo): string {
  return `<svg class="marcador__forma" viewBox="0 0 24 24" aria-hidden="true">${FORMA[nivel]}</svg>`
}

interface OpcionesIconoGranja {
  readonly nivel: NivelRiesgo
  /** Número de parada si la granja está en la ruta. */
  readonly orden?: number
  /** Atenuada: la granja no está elegida para la ruta. */
  readonly atenuada?: boolean
}

const TAMANO_FORMA = 28
const TAMANO_CROTAL = 40

/** Se reutiliza el mismo icono para las mismas opciones: uno nuevo haría que Leaflet rehiciera el marcador. */
const cache = new Map<string, DivIcon>()

/** Sin ruta, solo la forma del riesgo; en la ruta, el crotal con el número y la forma en la esquina. */
export function iconoGranja(opciones: OpcionesIconoGranja): DivIcon {
  // El número va como HTML: se fuerza a entero para que ningún dato raro del backend entre ahí.
  const orden = opciones.orden === undefined ? undefined : Math.trunc(Number(opciones.orden))
  const clave = `${opciones.nivel}|${orden ?? ''}|${opciones.atenuada ? 1 : 0}`
  const guardado = cache.get(clave)
  if (guardado) return guardado
  const icono = crearIconoGranja({ ...opciones, orden })
  cache.set(clave, icono)
  return icono
}

function crearIconoGranja({ nivel, orden, atenuada = false }: OpcionesIconoGranja): DivIcon {
  const clases = `marcador marcador--${nivel}${atenuada ? ' marcador--atenuado' : ''}`
  if (orden === undefined) {
    return divIcon({
      className: clases,
      html: forma(nivel),
      iconSize: [TAMANO_FORMA, TAMANO_FORMA],
      iconAnchor: [TAMANO_FORMA / 2, TAMANO_FORMA / 2],
      popupAnchor: [0, -TAMANO_FORMA / 2],
    })
  }
  return divIcon({
    className: `${clases} marcador--parada`,
    // aria-hidden: el nombre accesible del marcador es su título, no solo el número.
    html: `<span class="marcador__crotal" aria-hidden="true">${orden}</span>${forma(nivel)}`,
    iconSize: [TAMANO_CROTAL, TAMANO_CROTAL],
    iconAnchor: [TAMANO_CROTAL / 2, TAMANO_CROTAL],
    popupAnchor: [0, -TAMANO_CROTAL],
  })
}

const TAMANO_BASE = 36

/** El punto de salida del veterinario. */
export const ICONO_BASE: DivIcon = divIcon({
  className: 'marcador marcador--base',
  html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5" class="marcador__trazo"/></svg>',
  iconSize: [TAMANO_BASE, TAMANO_BASE],
  iconAnchor: [TAMANO_BASE / 2, TAMANO_BASE / 2],
  popupAnchor: [0, -TAMANO_BASE / 2],
})
