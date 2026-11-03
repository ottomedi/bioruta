import { NavLink, Outlet } from 'react-router'
import { HealthStatus } from '../components/HealthStatus'
import { NAV_ITEMS } from './navItems'

function navLinkClass({ isActive }: { isActive: boolean }): string {
  const base = 'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium'
  return isActive
    ? `${base} bg-green-100 text-green-900`
    : `${base} text-slate-700 hover:bg-slate-100`
}

function bottomLinkClass({ isActive }: { isActive: boolean }): string {
  const base =
    'flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-2 text-[11px] font-medium'
  return isActive ? `${base} text-green-800` : `${base} text-slate-600`
}

/**
 * Layout pensado primero para móvil: barra superior y navegación inferior.
 * Desde md la navegación pasa a la barra superior.
 */
export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <span className="text-lg font-bold text-green-800">BioRuta</span>
          <nav aria-label="Principal" className="hidden gap-1 md:flex">
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

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      <nav
        aria-label="Inferior"
        className="fixed inset-x-0 bottom-0 z-10 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
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
