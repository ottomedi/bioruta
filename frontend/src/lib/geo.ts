import type { Coordenadas } from '../api/types'

const RADIO_TIERRA_KM = 6371

function aRadianes(grados: number): number {
  return (grados * Math.PI) / 180
}

/** Distancia en línea recta entre dos puntos (fórmula de Haversine), en km. */
export function distanciaKm(a: Coordenadas, b: Coordenadas): number {
  const dLat = aRadianes(b.latitud - a.latitud)
  const dLon = aRadianes(b.longitud - a.longitud)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(a.latitud)) * Math.cos(aRadianes(b.latitud)) * Math.sin(dLon / 2) ** 2
  return 2 * RADIO_TIERRA_KM * Math.asin(Math.sqrt(h))
}
