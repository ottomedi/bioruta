import type { ReactNode } from 'react'

interface CardProps {
  readonly title?: string
  /** Botones o enlaces a la derecha del título. */
  readonly actions?: ReactNode
  readonly className?: string
  readonly children: ReactNode
}

export function Card({ title, actions, className = '', children }: CardProps) {
  return (
    <section
      className={`rounded-lg border border-linea bg-superficie p-4 shadow-tarjeta sm:p-5 ${className}`}
    >
      {(title || actions) && (
        <header className="-mx-4 mb-4 flex items-center justify-between gap-3 border-b border-linea px-4 pb-3 sm:-mx-5 sm:px-5">
          {title && <h2 className="text-lg font-semibold text-tinta">{title}</h2>}
          {actions}
        </header>
      )}
      {children}
    </section>
  )
}
