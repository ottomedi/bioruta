import { Navigate, type RouteObject } from 'react-router'
import { RequireAuth } from './auth/RequireAuth'
import { AppLayout } from './layout/AppLayout'
import { GranjaDetallePage } from './pages/granjas/GranjaDetallePage'
import { GranjasPage } from './pages/granjas/GranjasPage'
import { ImportarPage } from './pages/granjas/ImportarPage'
import { LoginPage } from './pages/LoginPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

/** Rutas de la app. Se exportan sin router para poder probarlas en memoria. */
export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  {
    // Todo lo demás pide sesión: sin ella, RequireAuth manda al login.
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/ruta" replace /> },
          {
            path: 'ruta',
            // El mapa (Leaflet) va en un chunk aparte: solo se descarga al abrir esta pantalla.
            lazy: async () => ({ Component: (await import('./pages/ruta/RutaPage')).RutaPage }),
          },
          { path: 'granjas', element: <GranjasPage /> },
          { path: 'granjas/importar', element: <ImportarPage /> },
          { path: 'granjas/:id', element: <GranjaDetallePage /> },
          {
            path: 'visitas',
            element: (
              <PlaceholderPage title="Visitas" description="Registro de entradas y salidas." />
            ),
          },
          {
            path: 'trazabilidad',
            element: (
              <PlaceholderPage
                title="Trazabilidad"
                description="Quién pasó por una granja positiva y a qué granjas fue después."
              />
            ),
          },
          {
            path: 'fuentes',
            element: (
              <PlaceholderPage
                title="De dónde salen las reglas"
                description="Cada regla del motor con su fuente pública o marcada como supuesto."
              />
            ),
          },
          {
            // Catálogo interno: se carga aparte para no engordar el bundle principal.
            path: 'dev/componentes',
            lazy: async () => ({
              Component: (await import('./pages/ComponentesPage')).ComponentesPage,
            }),
          },
          {
            path: '*',
            element: (
              <PlaceholderPage
                title="Página no encontrada"
                description="Esta dirección no existe."
              />
            ),
          },
        ],
      },
    ],
  },
]
