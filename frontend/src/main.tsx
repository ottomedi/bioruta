import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { ToastProvider } from './components/ui/ToastProvider'
import { USE_MOCKS } from './config'
import './index.css'
import { routes } from './router'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('No existe el elemento #root en index.html.')
}

// Los mocks arrancan antes de pintar para que ninguna petición salga a la red.
// Van en un chunk aparte que solo se descarga con USE_MOCKS activo.
// Si el worker no arranca, la app se pinta igual y las peticiones van a la red.
if (USE_MOCKS) {
  try {
    const { startMocks } = await import('./mocks/browser')
    await startMocks()
  } catch (error: unknown) {
    console.error('No se han podido activar los mocks (MSW):', error)
  }
}

createRoot(rootElement).render(
  <StrictMode>
    <ToastProvider>
      <RouterProvider router={createBrowserRouter(routes)} />
    </ToastProvider>
  </StrictMode>,
)
