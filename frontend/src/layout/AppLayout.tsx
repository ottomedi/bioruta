import { NavLink, Outlet } from 'react-router'
import { HealthStatus } from '../components/HealthStatus'
import { Crotal } from '../components/ui/Crotal'
import { NAV_ITEMS } from './navItems'

function navLinkClass({ isActive }: { isActive: boolean }): string {
  const base =
    'relative flex min-h-tactil items-center gap-2 px-3 text-[0.9375rem] font-medium transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-1 after:rounded-t-sm'
  return isActive
    ? `${base} text-white after:bg-crotal`
    : `${base} text-white/75 hover:text-white hover:after:bg-white/30`
}

function bottomLinkClass({ isActive }: { isActive: boolean }): string {
  const base =
    'relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 pt-2.5 pb-2 text-xs font-medium before:absolute before:inset-x-3 before:top-0 before:h-1 before:rounded-b-sm'
  return isActive ? `${base} text-crotal before:bg-crotal` : `${base} text-white/75`
}

/**
 * Layout pensado primero para móvil: barra superior y navegación inferior, las
 * dos en verde campo. Desde md la navegación pasa a la barra superior.
 */
export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-fondo text-tinta">
      <header className="sticky top-0 z-10 bg-campo text-white shadow-aviso">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 md:py-0">
          <span className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Crotal tamano="sm">BR</Crotal>
            BioRuta
          </span>
          <nav aria-label="Principal" className="hidden self-stretch md:flex">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                <Icon aria-hidden className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>
          <HealthStatus />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-28 md:py-8 md:pb-8">
        <Outlet />
      </main>

      <nav
        aria-label="Inferior"
        className="fixed inset-x-0 bottom-0 z-10 flex bg-campo pb-[env(safe-area-inset-bottom)] shadow-aviso md:hidden"
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={bottomLinkClass}>
            <Icon aria-hidden className="size-6" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
