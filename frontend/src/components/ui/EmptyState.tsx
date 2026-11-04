import { Inbox, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  readonly title: string
  readonly description?: string
  readonly icon?: LucideIcon
  /** Lo que puede hacer el usuario para salir del vacío (un botón, un enlace). */
  readonly action?: ReactNode
}

export function EmptyState({ title, description, icon: Icono = Inbox, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-linea bg-fondo px-4 py-10 text-center">
      <Icono aria-hidden className="size-10 text-campo/50" />
      <p className="text-lg font-semibold">{title}</p>
      {description && <p className="max-w-sm text-tinta-suave">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
