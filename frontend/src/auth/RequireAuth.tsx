import { Navigate, Outlet, useLocation } from 'react-router'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from './authContext'

/** Estado de navegación con el que el login sabe a dónde volver. */
export interface DesdeState {
  readonly desde: string
}

/** Rutas que piden sesión. Sin ella, manda al login recordando a dónde se quería ir. */
export function RequireAuth() {
  const { estado } = useAuth()
  const location = useLocation()

  if (estado.kind === 'comprobando') {
    return (
      <div className="grid min-h-dvh place-items-center bg-fondo text-campo">
        <Spinner label="Comprobando la sesión…" className="size-8" />
      </div>
    )
  }

  if (estado.kind === 'sin_sesion') {
    const state: DesdeState = { desde: `${location.pathname}${location.search}` }
    return <Navigate to="/login" replace state={state} />
  }

  return <Outlet />
}
