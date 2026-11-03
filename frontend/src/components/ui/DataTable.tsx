import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react'
import { useId, useMemo, useState, type ReactNode } from 'react'
import { normalizar } from '../../lib/texto'
import { EmptyState } from './EmptyState'

export interface Columna<T> {
  readonly key: string
  readonly header: string
  readonly render: (fila: T) => ReactNode
  /** Si la columna tiene valor de orden, su cabecera se puede pulsar para ordenar. */
  readonly sortValue?: (fila: T) => string | number
}

interface DataTableProps<T> {
  readonly caption: string
  readonly columns: readonly Columna<T>[]
  readonly rows: readonly T[]
  readonly getRowId: (fila: T) => string | number
  /** Si se da, aparece un buscador que filtra por este texto (sin tildes ni mayúsculas). */
  readonly getSearchText?: (fila: T) => string
  readonly emptyMessage?: string
}

type Direccion = 'asc' | 'desc'
interface Orden {
  readonly key: string
  readonly direccion: Direccion
}

const ARIA_SORT: Readonly<Record<Direccion, 'ascending' | 'descending'>> = {
  asc: 'ascending',
  desc: 'descending',
}

function comparar(a: string | number, b: string | number): number {
  return typeof a === 'number' && typeof b === 'number'
    ? a - b
    : String(a).localeCompare(String(b), 'es')
}

/** Primer clic ordena ascendente; los siguientes alternan. */
function siguienteOrden(actual: Orden | null, key: string): Orden {
  if (actual?.key !== key) return { key, direccion: 'asc' }
  return { key, direccion: actual.direccion === 'asc' ? 'desc' : 'asc' }
}

export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowId,
  getSearchText,
  emptyMessage = 'No hay resultados.',
}: DataTableProps<T>) {
  const [orden, setOrden] = useState<Orden | null>(null)
  const [filtro, setFiltro] = useState('')
  const searchId = useId()

  const visibles = useMemo(() => {
    const q = normalizar(filtro)
    const filtradas =
      q && getSearchText ? rows.filter((fila) => normalizar(getSearchText(fila)).includes(q)) : rows
    const columna = columns.find((c) => c.key === orden?.key)
    if (!orden || !columna?.sortValue) return filtradas
    const valor = columna.sortValue
    const signo = orden.direccion === 'asc' ? 1 : -1
    return [...filtradas].sort((a, b) => signo * comparar(valor(a), valor(b)))
  }, [rows, columns, orden, filtro, getSearchText])

  return (
    <div className="flex flex-col gap-3">
      {getSearchText && (
        <div className="relative max-w-sm">
          <label htmlFor={searchId} className="sr-only">
            Buscar en {caption}
          </label>
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-500"
          />
          <input
            id={searchId}
            type="search"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar…"
            className="min-h-tactil w-full rounded-lg border border-slate-300 bg-white pr-3 pl-10 focus-visible:outline-3 focus-visible:outline-marca"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              {columns.map((columna) => {
                const activa = orden?.key === columna.key ? orden : null
                return (
                  <th
                    key={columna.key}
                    scope="col"
                    aria-sort={activa ? ARIA_SORT[activa.direccion] : undefined}
                    className="px-3 py-2 font-semibold whitespace-nowrap"
                  >
                    {columna.sortValue ? (
                      <button
                        type="button"
                        onClick={() => setOrden((o) => siguienteOrden(o, columna.key))}
                        className="inline-flex min-h-tactil items-center gap-1 hover:text-slate-950"
                      >
                        {columna.header}
                        <IconoOrden direccion={activa?.direccion} />
                      </button>
                    ) : (
                      columna.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {visibles.map((fila) => (
              <tr key={getRowId(fila)} className="border-t border-slate-100">
                {columns.map((columna) => (
                  <td key={columna.key} className="px-3 py-2.5">
                    {columna.render(fila)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visibles.length === 0 && <EmptyState title={emptyMessage} />}
      {getSearchText && (
        <p role="status" className="sr-only">
          {visibles.length === 1 ? '1 resultado' : `${visibles.length} resultados`}
        </p>
      )}
    </div>
  )
}

function IconoOrden({ direccion }: { readonly direccion?: Direccion }) {
  if (direccion === 'asc') return <ArrowUp aria-hidden className="size-4" />
  if (direccion === 'desc') return <ArrowDown aria-hidden className="size-4" />
  return <ArrowUpDown aria-hidden className="size-4 text-slate-400" />
}
