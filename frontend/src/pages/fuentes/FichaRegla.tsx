import { ExternalLink } from 'lucide-react'
import { enlaceSeguro } from '../../api/reglas'
import type { Regla } from '../../api/types'
import { TipoReglaBadge } from './TipoReglaBadge'

/** El valor viene de risk_config.json: puede ser texto, número o una estructura. */
function textoValor(valor: Regla['valor']): string {
  if (typeof valor === 'string') return valor
  return JSON.stringify(valor) ?? '—'
}

export function FichaRegla({ regla }: { readonly regla: Regla }) {
  const url = enlaceSeguro(regla.url)
  const parcial = regla.tipo === 'supuesto' && Boolean(regla.fuente)
  return (
    <article
      id={regla.id}
      tabIndex={-1}
      aria-labelledby={`${regla.id}-titulo`}
      className="scroll-mt-24 rounded-lg border border-linea bg-superficie p-4 shadow-tarjeta focus:outline-3 focus:outline-campo sm:p-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <h2 id={`${regla.id}-titulo`} className="text-lg font-semibold">
          <span className="font-crotal text-campo">{regla.id}</span> {regla.descripcion}
        </h2>
        <span className="flex flex-col items-end gap-0.5">
          <TipoReglaBadge tipo={regla.tipo} />
          {parcial && <span className="text-xs text-tinta-suave">con fuente en parte</span>}
        </span>
      </header>
      <dl className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-[auto_1fr]">
        <dt className="font-medium text-tinta-suave">Valor</dt>
        <dd>{textoValor(regla.valor)}</dd>
        <dt className="font-medium text-tinta-suave">Fuente</dt>
        <dd>{regla.fuente ?? 'Sin fuente: es una decisión nuestra y se puede cambiar.'}</dd>
        {regla.cita && (
          <>
            <dt className="font-medium text-tinta-suave">Dónde</dt>
            <dd>{regla.cita}</dd>
          </>
        )}
      </dl>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-tactil items-center gap-1.5 font-semibold text-campo underline-offset-4 hover:underline"
        >
          Abrir el documento <ExternalLink aria-hidden className="size-4" />
          <span className="sr-only">de {regla.id} (se abre en otra pestaña)</span>
        </a>
      )}
    </article>
  )
}
