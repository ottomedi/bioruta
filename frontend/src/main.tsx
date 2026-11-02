import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import './index.css'
import { routes } from './router'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('No existe el elemento #root en index.html.')
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={createBrowserRouter(routes)} />
  </StrictMode>,
)
