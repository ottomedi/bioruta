import { LoaderCircle } from 'lucide-react'

interface SpinnerProps {
  /** Lo que lee un lector de pantalla mientras gira. */
  readonly label?: string
  readonly className?: string
  /** Solo el icono, sin rol ni texto: para dentro de un botón, que ya avisa con aria-busy. */
  readonly decorativo?: boolean
}

export function Spinner({
  label = 'Cargando…',
  className = 'size-5',
  decorativo = false,
}: SpinnerProps) {
  if (decorativo) {
    return <LoaderCircle aria-hidden className={`animate-spin ${className}`} />
  }
  return (
    <span role="status" className="inline-flex items-center">
      <LoaderCircle aria-hidden className={`animate-spin ${className}`} />
      <span className="sr-only">{label}</span>
    </span>
  )
}
