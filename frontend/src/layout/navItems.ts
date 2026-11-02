import { BookOpen, ClipboardList, Map, Network, Warehouse, type LucideIcon } from 'lucide-react'

export interface NavItem {
  readonly to: string
  readonly label: string
  readonly icon: LucideIcon
}

/** Secciones de la navegación principal, en el orden en que se enseñan. */
export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/ruta', label: 'Ruta', icon: Map },
  { to: '/granjas', label: 'Granjas', icon: Warehouse },
  { to: '/visitas', label: 'Visitas', icon: ClipboardList },
  { to: '/trazabilidad', label: 'Trazabilidad', icon: Network },
  { to: '/fuentes', label: 'Fuentes', icon: BookOpen },
]
