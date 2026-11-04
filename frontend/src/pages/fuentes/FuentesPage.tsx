import { useCallback, useEffect } from 'react'
import { useLocation } from 'react-router'
import { listarReglas } from '../../api/reglas'
import type { Regla, TipoRegla } from '../../api/types'
import { useAuth } from '../../auth/authContext'
import { ErrorCarga } from '../../components/ui/ErrorCarga'
import { Spinner } from '../../components/ui/Spinner'
import { ETIQUETA_TIPO_REGLA } from '../../domain/etiquetas'
import { useCarga } from '../../lib/useCarga'
import { FichaRegla } from './FichaRegla'
import { TipoReglaBadge } from './TipoReglaBadge'

const TIPOS = Object.keys(ETIQUETA_TIPO_REGLA) as TipoRegla[]

const QUE_ES: Readonly<Record<TipoRegla, string>> = {
  normativa: 'Lo dice una ley o un reglamento.',
  guia: 'Lo dice una guía oficial o un estudio científico.',
  supuesto: 'Decisión nuestra, sin fuente o solo en parte. Es configurable.',
}

function contar(reglas: readonly Regla[], tipo: TipoRegla): number {
  return reglas.filter((r) => r.tipo === tipo).length
}

/** Supuestos con fuente: reglas que mezclan tipos y van como supuesto por su parte sin respaldo. */
function contarParciales(reglas: readonly Regla[]): number {
  return reglas.filter((r) => r.tipo === 'supuesto' && r.fuente).length
}

/** Un hash mal escrito (#%) haría fallar decodeURIComponent: entonces se usa tal cual. */
function decodificar(texto: string): string {
  try {
    return decodeURIComponent(texto)
  } catch {
    return texto
  }
}

/** Con /fuentes#R03 se va a esa regla en cuanto carga la lista (las paradas de la ruta enlazan así). */
function useIrALaRegla(cargada: boolean) {
  const { hash } = useLocation()
  useEffect(() => {
    if (!cargada || !hash) return
    const destino = document.getElementById(decodificar(hash.slice(1)))
    destino?.scrollIntoView({ block: 'start' })
    destino?.focus({ preventScroll: true })
  }, [cargada, hash])
}

/**
 * De dónde sale cada regla del motor. Sin contacto con el sector, la
 * validación son estas fuentes públicas; lo que no tiene fuente se dice.
 */
export function FuentesPage() {
  const { request } = useAuth()
  const cargar = useCallback((signal: AbortSignal) => listarReglas(request, signal), [request])
  const [estado, reintentar] = useCarga(cargar)
  useIrALaRegla(estado.kind === 'ok')

  return (
    <div className="flex flex-col gap-5">
      <title>De dónde salen las reglas · BioRuta</title>
      <header>
        <h1 className="text-3xl font-bold tracking-tight">De dónde salen las reglas</h1>
        <p className="mt-1 max-w-prose text-lg text-tinta-suave">
          Cada decisión de la ruta sale de una de estas reglas. Las que tienen respaldo citan su
          ley, guía o estudio; las que no, están marcadas como supuesto.
        </p>
      </header>

      <section aria-label="Qué significa cada tipo" className="grid gap-3 sm:grid-cols-3">
        {TIPOS.map((tipo) => (
          <div
            key={tipo}
            className="flex flex-col items-start gap-1.5 rounded-lg border border-linea bg-superficie p-3"
          >
            <span className="flex w-full items-center justify-between gap-2">
              <TipoReglaBadge tipo={tipo} />
              {estado.kind === 'ok' && (
                <span className="text-2xl font-bold">{contar(estado.datos, tipo)}</span>
              )}
            </span>
            <p className="text-sm text-tinta-suave">{QUE_ES[tipo]}</p>
            {tipo === 'supuesto' && estado.kind === 'ok' && contarParciales(estado.datos) > 0 && (
              <p className="text-sm font-medium">
                {contarParciales(estado.datos)} de ellas tienen fuente en una parte.
              </p>
            )}
          </div>
        ))}
      </section>

      {estado.kind === 'cargando' && <Spinner label="Cargando reglas…" className="size-8" />}
      {estado.kind === 'error' && (
        <ErrorCarga
          titulo="No se han podido cargar las reglas"
          mensaje={estado.mensaje}
          onReintentar={reintentar}
        />
      )}
      {estado.kind === 'ok' && (
        <div className="flex flex-col gap-3">
          {estado.datos.map((regla) => (
            <FichaRegla key={regla.id} regla={regla} />
          ))}
        </div>
      )}
    </div>
  )
}
