import 'leaflet/dist/leaflet.css'
import { latLngBounds, type LatLngExpression } from 'leaflet'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import { Link } from 'react-router'
import type { Coordenadas, GranjaResumen, RutaCalculada } from '../../api/types'
import { ETIQUETA_ESTADO, ETIQUETA_TIPO_GRANJA, NIVEL_POR_ESTADO } from '../../domain/riesgo'
import { EstadoBadge } from '../ui/RiskBadge'
import { ICONO_BASE, iconoGranja } from './iconos'

/**
 * Teselas de OpenStreetMap: no piden clave. Se atenúan con CSS (.mapa-teselas)
 * para que destaquen los colores de riesgo. CARTO, que era la primera opción,
 * exige ya una clave de API.
 */
const TESELAS = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATRIBUCION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">colaboradores de OpenStreetMap</a>'
const ZOOM_MAXIMO = 19
/** Con un solo punto (solo la base, una parada) fitBounds acercaría hasta el máximo. */
const ZOOM_MAXIMO_AJUSTE = 15
const ZOOM_INICIAL = 11
const MARGEN_AJUSTE_PX = 40

interface MapViewProps {
  readonly granjas: readonly GranjaResumen[]
  /** Punto de salida del veterinario. */
  readonly base?: Coordenadas
  readonly ruta?: RutaCalculada
  /** Si se da, las granjas que no están aquí se ven atenuadas. */
  readonly seleccionadas?: ReadonlySet<number>
  readonly className?: string
}

function aLatLng({ latitud, longitud }: Coordenadas): [number, number] {
  return [latitud, longitud]
}

/** Encaja en la vista todos los puntos cada vez que cambian. */
function AjustarVista({ puntos }: { readonly puntos: readonly [number, number][] }) {
  const map = useMap()
  const clave = JSON.stringify(puntos)
  useEffect(() => {
    const lista = JSON.parse(clave) as [number, number][]
    if (lista.length === 0) return
    map.fitBounds(latLngBounds(lista), {
      padding: [MARGEN_AJUSTE_PX, MARGEN_AJUSTE_PX],
      maxZoom: ZOOM_MAXIMO_AJUSTE,
    })
  }, [map, clave])
  return null
}

interface Tramo {
  readonly clave: string
  readonly puntos: LatLngExpression[]
  readonly peligroso: boolean
}

/**
 * Con Haversine la geometría son la base y las granjas, y cada tramo lleva a una
 * parada: se puede pintar en rojo el que es una exposición. Con un trazado por
 * carretera (OSRM) no se sabe dónde empieza cada tramo y va todo en una línea.
 */
function tramosDe(ruta: RutaCalculada): Tramo[] {
  const puntos = ruta.geometria.map(aLatLng)
  if (puntos.length !== ruta.paradas.length + 1) {
    return [{ clave: `${ruta.criterio}-trazado`, puntos, peligroso: false }]
  }
  // La clave cambia con el criterio y el peligro: Leaflet no actualiza la clase CSS de
  // una línea ya pintada, así que hay que crear una nueva.
  return ruta.paradas.map((parada, i) => ({
    clave: `${ruta.criterio}-${parada.orden}-${parada.tramo_peligroso ? 'peligroso' : 'normal'}`,
    puntos: [puntos[i]!, puntos[i + 1]!],
    peligroso: parada.tramo_peligroso,
  }))
}

export function MapView({ granjas, base, ruta, seleccionadas, className = '' }: MapViewProps) {
  const ordenPorGranja = useMemo(
    () => new Map(ruta?.paradas.map((p) => [p.granja.id, p.orden]) ?? []),
    [ruta],
  )
  const tramos = useMemo(() => (ruta ? tramosDe(ruta) : []), [ruta])
  const puntos = useMemo(() => {
    const visibles = ruta ? ruta.paradas.map((p) => p.granja) : granjas
    return [...(base ? [aLatLng(base)] : []), ...visibles.map((g) => aLatLng(g.coordenadas))]
  }, [granjas, base, ruta])
  const centro = puntos[0] ?? [40.4, -3.7]

  return (
    <MapContainer
      center={centro}
      zoom={ZOOM_INICIAL}
      scrollWheelZoom={false}
      className={`z-0 rounded-lg border border-linea shadow-tarjeta ${className}`}
    >
      <TileLayer
        url={TESELAS}
        attribution={ATRIBUCION}
        maxZoom={ZOOM_MAXIMO}
        className="mapa-teselas"
      />
      <AjustarVista puntos={puntos} />

      {tramos.map((tramo) => (
        <Polyline
          key={tramo.clave}
          positions={tramo.puntos}
          // La clase va como opción de creación: pathOptions solo se aplica con setStyle,
          // que no toca las clases.
          className={tramo.peligroso ? 'ruta-tramo ruta-tramo--peligroso' : 'ruta-tramo'}
          pathOptions={{
            weight: tramo.peligroso ? 5 : 4,
            dashArray: tramo.peligroso ? '8 8' : undefined,
          }}
        />
      ))}

      {base && (
        <Marker position={aLatLng(base)} icon={ICONO_BASE} title="Salida: tu base">
          <Popup>Salida: tu base</Popup>
        </Marker>
      )}

      {granjas.map((granja) => {
        const orden = ordenPorGranja.get(granja.id)
        const enRuta = orden !== undefined
        // Con ruta calculada solo cuentan sus paradas; sin ella, la selección (si hay alguna).
        const haySeleccion = seleccionadas !== undefined && seleccionadas.size > 0
        const atenuada = ruta ? !enRuta : haySeleccion && !seleccionadas.has(granja.id)
        const titulo = `${enRuta ? `Parada ${orden}: ` : ''}${granja.nombre}, ${ETIQUETA_ESTADO[granja.estado_actual].toLowerCase()}`
        return (
          <Marker
            // react-leaflet solo pone el título al crear el marcador: si cambia la parada, se recrea.
            key={`${granja.id}-${orden ?? 0}`}
            position={aLatLng(granja.coordenadas)}
            icon={iconoGranja({ nivel: NIVEL_POR_ESTADO[granja.estado_actual], orden, atenuada })}
            title={titulo}
            zIndexOffset={enRuta ? 1000 : 0}
          >
            <Popup>
              <div className="flex flex-col items-start gap-1.5 font-sans text-sm">
                {enRuta && <span className="font-semibold text-campo">Parada {orden}</span>}
                <strong className="text-base">{granja.nombre}</strong>
                <span>{ETIQUETA_TIPO_GRANJA[granja.tipo]}</span>
                <EstadoBadge estado={granja.estado_actual} />
                <Link to={`/granjas/${granja.id}`} className="font-semibold text-campo underline">
                  Ver ficha
                </Link>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
