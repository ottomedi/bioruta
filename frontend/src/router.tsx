import { Navigate, type RouteObject } from 'react-router'
import { AppLayout } from './layout/AppLayout'
import { GranjaDetallePage } from './pages/GranjaDetallePage'
import { LoginPage } from './pages/LoginPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

/** Rutas de la app. Se exportan sin router para poder probarlas en memoria. */
export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/ruta" replace /> },
      {
        path: 'ruta',
        element: (
          <PlaceholderPage
            title="Ruta del día"
            description="Elegir granjas, calcular la ruta y verla en el mapa (días 5 y 6)."
          />
        ),
      },
      {
        path: 'granjas',
        element: (
          <PlaceholderPage
            title="Granjas"
            description="Lista con filtros y nivel de riesgo (día 4)."
          />
        ),
      },
      { path: 'granjas/:id', element: <GranjaDetallePage /> },
      {
        path: 'visitas',
        element: (
          <PlaceholderPage title="Visitas" description="Registro de entradas y salidas (día 7)." />
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
        path: '*',
        element: (
          <PlaceholderPage title="Página no encontrada" description="Esta dirección no existe." />
        ),
      },
    ],
  },
]
