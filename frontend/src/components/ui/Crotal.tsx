type Tamano = 'sm' | 'md' | 'lg'

interface CrotalProps {
  /** El código que se lee: número de parada, código de granja. */
  readonly children: string | number
  readonly tamano?: Tamano
  /** Texto para lectores de pantalla cuando el código solo no se entiende («Parada 3»). */
  readonly label?: string
}

const CLASES_TAMANO: Readonly<Record<Tamano, string>> = {
  sm: 'h-7 min-w-7 px-1.5 pt-1.5 text-sm before:top-1 before:size-1',
  md: 'h-9 min-w-9 px-2 pt-2 text-lg before:top-1.5 before:size-1.5',
  lg: 'h-16 min-w-14 px-3 pt-3.5 text-3xl before:top-2 before:size-2.5',
}

/**
 * Identificador con forma de crotal, la etiqueta amarilla de la oreja: arriba
 * redondeado y con el agujero de la pinza. Es el rasgo propio de la app, para
 * códigos de granja y números de parada.
 */
export function Crotal({ children, tamano = 'md', label }: CrotalProps) {
  return (
    <span
      aria-label={label}
      className={`relative inline-flex shrink-0 items-center justify-center rounded-t-[45%] rounded-b-md bg-crotal font-crotal leading-none font-bold text-crotal-tinta shadow-[inset_0_-2px_0_var(--color-crotal-oscuro)] before:absolute before:left-1/2 before:-translate-x-1/2 before:rounded-full before:bg-crotal-tinta/60 before:content-[''] ${CLASES_TAMANO[tamano]}`}
    >
      {children}
    </span>
  )
}
