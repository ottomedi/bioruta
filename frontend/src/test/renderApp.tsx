import { render } from '@testing-library/react'
import { StrictMode } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AuthProvider } from '../auth/AuthProvider'
import { guardarToken } from '../auth/session'
import { ToastProvider } from '../components/ui/ToastProvider'
import { TOKEN_DEMO } from '../mocks/fixtures'
import { routes } from '../router'

/** Monta la app entera en memoria, en la ruta indicada. */
export function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  // Con StrictMode, como en main.tsx: los efectos se montan dos veces y así se prueba que aguantan.
  render(
    <StrictMode>
      <ToastProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ToastProvider>
    </StrictMode>,
  )
  return router
}

/** Deja guardado el token de los mocks, como si ya se hubiera entrado antes. */
export function conSesionDemo(): void {
  guardarToken(TOKEN_DEMO)
}
