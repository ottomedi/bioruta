import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'

interface PaginacionProps {
  readonly page: number
  readonly limit: number
  readonly total: number
  readonly onCambiar: (page: number) => void
}

/** Anterior y siguiente. Con una sola página no se enseña. */
export function Paginacion({ page, limit, total, onCambiar }: PaginacionProps) {
  const paginas = Math.max(1, Math.ceil(total / limit))
  if (paginas === 1) return null
  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-3">
      <Button variante="secundario" disabled={page <= 1} onClick={() => onCambiar(page - 1)}>
        <ChevronLeft aria-hidden className="size-5" /> Anterior
      </Button>
      <p className="text-tinta-suave">
        Página {page} de {paginas}
      </p>
      <Button variante="secundario" disabled={page >= paginas} onClick={() => onCambiar(page + 1)}>
        Siguiente <ChevronRight aria-hidden className="size-5" />
      </Button>
    </nav>
  )
}
