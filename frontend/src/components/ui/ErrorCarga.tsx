import { CircleAlert } from 'lucide-react'
import { Button } from './Button'

interface ErrorCargaProps {
  readonly titulo: string
  readonly mensaje: string
  readonly onReintentar: () => void
}

/** Lo que se enseña cuando una carga falla: qué pasó y un botón para volver a probar. */
export function ErrorCarga({ titulo, mensaje, onReintentar }: ErrorCargaProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-riesgo-alto bg-riesgo-alto-suave p-4"
    >
      <p className="flex items-center gap-2 font-semibold text-riesgo-alto">
        <CircleAlert aria-hidden className="size-5" />
        {titulo}
      </p>
      <p>{mensaje}</p>
      <Button variante="secundario" onClick={onReintentar}>
        Reintentar
      </Button>
    </div>
  )
}
