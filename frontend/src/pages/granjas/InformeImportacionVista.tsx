import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import type { InformeImportacion } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { KpiCard } from '../../components/ui/KpiCard'

/** La fila 0 la usa el importador para los fallos de la cabecera, no de una fila de datos. */
function textoFila(fila: number): string {
  return fila === 0 ? 'Cabecera' : String(fila)
}

export function InformeImportacionVista({ informe }: { readonly informe: InformeImportacion }) {
  const { filas_totales, creadas, actualizadas, errores } = informe
  const fallidas = new Set(errores.map((e) => e.fila)).size
  const tituloRef = useRef<HTMLHeadingElement>(null)

  // Una región live que nace con texto no siempre se anuncia: se lleva el foco al informe.
  useEffect(() => {
    tituloRef.current?.focus()
  }, [informe])

  return (
    <section aria-labelledby="informe" className="flex flex-col gap-4">
      <h2 id="informe" ref={tituloRef} tabIndex={-1} className="text-2xl font-bold tracking-tight">
        Informe de importación
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Filas leídas" value={filas_totales} />
        <KpiCard label="Creadas" value={creadas} tono={creadas > 0 ? 'bajo' : undefined} />
        <KpiCard label="Actualizadas" value={actualizadas} />
        <KpiCard label="Filas con errores" value={fallidas} tono={fallidas > 0 ? 'alto' : 'bajo'} />
      </div>

      {errores.length > 0 && (
        <Card title="Errores por fila">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[0.9375rem]">
              <caption className="sr-only">Errores por fila</caption>
              <thead className="border-b-2 border-campo text-campo">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Fila
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Campo
                  </th>
                  <th scope="col" className="px-3 py-2 font-semibold">
                    Qué falla
                  </th>
                </tr>
              </thead>
              <tbody>
                {errores.map((e, i) => (
                  <tr key={`${e.fila}-${e.campo ?? ''}-${i}`} className="border-t border-linea">
                    <td className="px-3 py-2.5 font-semibold">{textoFila(e.fila)}</td>
                    <td className="px-3 py-2.5">{e.campo ?? '—'}</td>
                    <td className="px-3 py-2.5">{e.mensaje}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {informe.entidad === 'granjas' && creadas + actualizadas > 0 && (
        <Link
          to="/granjas"
          className="self-start font-semibold text-campo underline-offset-4 hover:underline"
        >
          Ver las granjas en la lista
        </Link>
      )}
    </section>
  )
}
