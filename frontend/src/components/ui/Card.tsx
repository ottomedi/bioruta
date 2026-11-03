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
    <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {(title || actions) && (
        <header className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {actions}
        </header>
      )}
      {children}
    </section>
  )
}
