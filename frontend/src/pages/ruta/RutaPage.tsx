import { ArrowLeft, Calculator, CircleAlert } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { listarGranjas } from '../../api/granjas'
import { calcularRutas } from '../../api/rutas'
import type { ComparacionRutas, CriterioRuta, Usuario } from '../../api/types'
import { useAuth } from '../../auth/authContext'
import { MapView } from '../../components/mapa/MapView'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorCarga } from '../../components/ui/ErrorCarga'
import { RiskBadge } from '../../components/ui/RiskBadge'
import { Spinner } from '../../components/ui/Spinner'
import { mensajeDeError } from '../../lib/errores'
import { hoyEnMadrid } from '../../lib/fecha'
import { useCarga } from '../../lib/useCarga'
import { ListaParadas } from './ListaParadas'
import { SelectorCriterio } from './SelectorCriterio'
import { SelectorGranjas } from './SelectorGranjas'

/** Cuántas granjas se cargan para elegir. Con el seed (25) caben todas. */
const GRANJAS_PARA_ELEGIR = 100

type Calculo =
  | { readonly kind: 'eligiendo' }
  | { readonly kind: 'calculando' }
  | { readonly kind: 'hecho'; readonly comparacion: ComparacionRutas }
  | { readonly kind: 'error'; readonly mensaje: string }

/** RequireAuth garantiza la sesión; si faltara, es un fallo de programación. */
function useUsuario(): Usuario {
  const { estado } = useAuth()
  if (estado.kind !== 'con_sesion') throw new Error('La ruta del día necesita una sesión abierta.')
  return estado.usuario
}

/**
 * Ruta del día: elegir granjas, calcular y ver la ruta en el mapa con sus
 * paradas. En móvil el mapa va arriba y la lista debajo.
 */
export function RutaPage() {
  const { request } = useAuth()
  const { veterinario } = useUsuario()
  const cargar = useCallback(
    (signal: AbortSignal) => listarGranjas(request, { limit: GRANJAS_PARA_ELEGIR }, signal),
    [request],
  )
  const [granjas, reintentar] = useCarga(cargar)
  const [seleccionadas, setSeleccionadas] = useState<ReadonlySet<number>>(new Set())
  const [calculo, setCalculo] = useState<Calculo>({ kind: 'eligiendo' })
  const [criterio, setCriterio] = useState<CriterioRuta>('segura')
  const resultadoRef = useRef<HTMLDivElement>(null)
  const seleccionRef = useRef<HTMLDivElement>(null)
  const volviendoRef = useRef(false)

  // El botón pulsado desaparece al cambiar de vista: el foco va a lo que aparece.
  useEffect(() => {
    if (calculo.kind === 'hecho') resultadoRef.current?.focus()
    if (calculo.kind === 'eligiendo' && volviendoRef.current) {
      volviendoRef.current = false
      seleccionRef.current?.focus()
    }
  }, [calculo.kind])

  function volverASeleccion() {
    volviendoRef.current = true
    setCalculo({ kind: 'eligiendo' })
  }

  async function calcular() {
    setCalculo({ kind: 'calculando' })
    try {
      const comparacion = await calcularRutas(request, {
        veterinario_id: veterinario.id,
        fecha: hoyEnMadrid(),
        granja_ids: [...seleccionadas],
      })
      setCalculo({ kind: 'hecho', comparacion })
    } catch (error: unknown) {
      setCalculo({
        kind: 'error',
        mensaje: mensajeDeError(error, 'No se ha podido calcular la ruta.'),
      })
    }
  }

  const lista = granjas.kind === 'ok' ? granjas.datos.items : []
  const ruta =
    calculo.kind === 'hecho'
      ? criterio === 'segura'
        ? calculo.comparacion.segura
        : calculo.comparacion.mas_corta
      : undefined

  return (
    <div className="flex flex-col gap-5">
      <title>Ruta del día · BioRuta</title>
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Ruta del día</h1>
        <p className="mt-1 text-lg text-tinta-suave">
          Elige las granjas de hoy y calcula en qué orden visitarlas.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
        <section
          aria-label="Mapa"
          className="flex flex-col gap-2 lg:sticky lg:top-20 lg:order-last"
        >
          <MapView
            granjas={lista}
            base={veterinario.base}
            ruta={ruta}
            seleccionadas={seleccionadas}
            className="h-[45dvh] min-h-72 lg:h-[calc(100dvh-12rem)]"
          />
          <Leyenda />
        </section>

        <div className="flex flex-col gap-4">
          {granjas.kind === 'cargando' && <Spinner label="Cargando granjas…" className="size-8" />}
          {granjas.kind === 'error' && (
            <ErrorCarga
              titulo="No se han podido cargar las granjas"
              mensaje={granjas.mensaje}
              onReintentar={reintentar}
            />
          )}
          {granjas.kind === 'ok' && lista.length === 0 && (
            <EmptyState
              title="Todavía no hay granjas"
              description="Importa un fichero desde Granjas."
            />
          )}

          {calculo.kind === 'hecho' && ruta ? (
            <Card
              title={ruta.paradas.length === 1 ? '1 parada' : `${ruta.paradas.length} paradas`}
              actions={
                <Button
                  variante="fantasma"
                  onClick={volverASeleccion}
                  className="whitespace-nowrap"
                >
                  <ArrowLeft aria-hidden className="size-5" /> Cambiar granjas
                </Button>
              }
            >
              <div
                ref={resultadoRef}
                tabIndex={-1}
                aria-label={`Ruta calculada: ${ruta.paradas.length} paradas`}
                className="flex flex-col gap-4 focus:outline-none"
              >
                <SelectorCriterio
                  comparacion={calculo.comparacion}
                  criterio={criterio}
                  onCambiar={setCriterio}
                />
                <ListaParadas ruta={ruta} />
              </div>
            </Card>
          ) : (
            lista.length > 0 && (
              <Card title="Granjas de hoy">
                <div
                  ref={seleccionRef}
                  tabIndex={-1}
                  aria-label="Granjas de hoy"
                  className="flex flex-col gap-4 focus:outline-none"
                >
                  <SelectorGranjas
                    granjas={lista}
                    seleccionadas={seleccionadas}
                    disabled={calculo.kind === 'calculando'}
                    onCambiar={(nuevas) => {
                      setSeleccionadas(nuevas)
                      // Un error de cálculo era de la selección anterior.
                      if (calculo.kind === 'error') setCalculo({ kind: 'eligiendo' })
                    }}
                  />
                  {calculo.kind === 'error' && (
                    <p
                      role="alert"
                      className="flex items-center gap-2 rounded-lg border border-riesgo-alto bg-riesgo-alto-suave p-3 font-semibold text-riesgo-alto"
                    >
                      <CircleAlert aria-hidden className="size-5 shrink-0" />
                      {calculo.mensaje}
                    </p>
                  )}
                  <Button
                    onClick={() => void calcular()}
                    disabled={seleccionadas.size === 0}
                    cargando={calculo.kind === 'calculando'}
                    className="self-start"
                  >
                    <Calculator aria-hidden className="size-5" /> Calcular ruta
                  </Button>
                </div>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  )
}

function Leyenda() {
  return (
    <div
      role="group"
      aria-label="Leyenda del mapa"
      className="flex flex-wrap items-center gap-2 text-sm"
    >
      <RiskBadge nivel="alto" label="Positiva" />
      <RiskBadge nivel="medio" label="Sospechosa o vigilancia" />
      <RiskBadge nivel="bajo" label="Sin incidencias" />
      <span className="inline-flex items-center gap-1.5 text-tinta-suave">
        <span
          aria-hidden
          className="inline-block h-1 w-6 border-t-4 border-dashed border-riesgo-alto"
        />
        Tramo con exposición
      </span>
    </div>
  )
}
