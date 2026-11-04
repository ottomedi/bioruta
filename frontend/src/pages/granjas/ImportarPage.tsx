import { ArrowLeft, CircleAlert, FileDown, Upload } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { importar } from '../../api/importacion'
import type { EntidadImportacion, InformeImportacion } from '../../api/types'
import { useAuth } from '../../auth/authContext'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ETIQUETA_ENTIDAD } from '../../domain/etiquetas'
import { mensajeDeError } from '../../lib/errores'
import { InformeImportacionVista } from './InformeImportacionVista'

const CAMPO =
  'mt-1 min-h-tactil w-full rounded-md border border-linea bg-superficie px-3 text-base text-tinta hover:border-campo'

const ENTIDADES = Object.entries(ETIQUETA_ENTIDAD) as [EntidadImportacion, string][]

type Envio =
  | { readonly kind: 'inicial' }
  | { readonly kind: 'enviando' }
  | { readonly kind: 'hecho'; readonly informe: InformeImportacion }
  | { readonly kind: 'error'; readonly mensaje: string }

/**
 * Sube un CSV o JSON a POST /import y enseña el informe: cuántas filas entraron
 * y qué falló en cada una. Las filas válidas se guardan aunque otras fallen.
 */
export function ImportarPage() {
  const { request } = useAuth()
  const [envio, setEnvio] = useState<Envio>({ kind: 'inicial' })
  const [entidad, setEntidad] = useState<EntidadImportacion>('granjas')
  const [fichero, setFichero] = useState<File | null>(null)
  const ficheroId = useId()
  const entidadId = useId()

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!fichero) {
      setEnvio({ kind: 'error', mensaje: 'Elige un fichero antes de importar.' })
      return
    }
    setEnvio({ kind: 'enviando' })
    try {
      setEnvio({ kind: 'hecho', informe: await importar(request, fichero, entidad) })
    } catch (error: unknown) {
      setEnvio({ kind: 'error', mensaje: mensajeDeError(error, 'No se ha podido importar.') })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <title>Importar · BioRuta</title>
      <Link
        to="/granjas"
        className="inline-flex min-h-tactil items-center gap-1 self-start font-medium text-campo underline-offset-4 hover:underline"
      >
        <ArrowLeft aria-hidden className="size-5" /> Granjas
      </Link>
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Importar fichero</h1>
        <p className="mt-1 max-w-prose text-lg text-tinta-suave">
          Sube un CSV o JSON con granjas, visitas o estados sanitarios. Las filas correctas se
          guardan aunque otras fallen, y abajo verás qué falló en cada una.
        </p>
      </header>

      <Card>
        <form onSubmit={(e) => void enviar(e)} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
            <div>
              <label htmlFor={entidadId} className="font-medium">
                Qué contiene
              </label>
              <select
                id={entidadId}
                value={entidad}
                onChange={(e) => {
                  setEntidad(e.target.value as EntidadImportacion)
                  setEnvio({ kind: 'inicial' })
                }}
                className={CAMPO}
              >
                {ENTIDADES.map(([valor, texto]) => (
                  <option key={valor} value={valor}>
                    {texto}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={ficheroId} className="font-medium">
                Fichero
              </label>
              <input
                id={ficheroId}
                type="file"
                onChange={(e) => {
                  setFichero(e.target.files?.[0] ?? null)
                  setEnvio({ kind: 'inicial' })
                }}
                accept=".csv,.json,text/csv,application/json"
                className={`${CAMPO} py-2 file:mr-3 file:rounded-sm file:border-0 file:bg-campo-suave file:px-3 file:py-1 file:font-semibold file:text-campo`}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" cargando={envio.kind === 'enviando'}>
              <Upload aria-hidden className="size-5" /> Importar
            </Button>
            <a
              href="/ejemplos/granjas-ejemplo.csv"
              download
              className="inline-flex min-h-tactil items-center gap-1 font-medium text-campo underline-offset-4 hover:underline"
            >
              <FileDown aria-hidden className="size-5" /> CSV de ejemplo
            </a>
          </div>
        </form>
      </Card>

      {envio.kind === 'error' && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-riesgo-alto bg-riesgo-alto-suave p-4 font-semibold text-riesgo-alto"
        >
          <CircleAlert aria-hidden className="size-5 shrink-0" />
          {envio.mensaje}
        </p>
      )}
      {envio.kind === 'hecho' && <InformeImportacionVista informe={envio.informe} />}
    </div>
  )
}
