import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from './components/ui/ToastProvider'
import { routes } from './router'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>,
  )
  return router
}

describe('rutas', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ estado: 'ok', version: '0.1.0' })),
    )
  })

  it('redirige la raíz a la ruta del día', async () => {
    const router = renderAt('/')

    expect(await screen.findByRole('heading', { name: 'Ruta del día' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/ruta')
  })

  it('pone el título de la pestaña según la página', async () => {
    renderAt('/visitas')

    await screen.findByRole('heading', { name: 'Visitas' })
    expect(document.title).toBe('Visitas · BioRuta')
  })

  it.each([
    ['/granjas', 'Granjas'],
    ['/granjas/7', 'Granja 7'],
    ['/visitas', 'Visitas'],
    ['/trazabilidad', 'Trazabilidad'],
    ['/fuentes', 'De dónde salen las reglas'],
    ['/no-existe', 'Página no encontrada'],
  ])('%s enseña «%s»', async (path, title) => {
    renderAt(path)

    expect(await screen.findByRole('heading', { name: title })).toBeInTheDocument()
  })

  it('el login va sin navegación y entra a la ruta del día', async () => {
    renderAt('/login')
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('link', { name: 'Entrar' }))

    expect(await screen.findByRole('heading', { name: 'Ruta del día' })).toBeInTheDocument()
  })

  it('la navegación inferior lleva a cada sección y marca la activa', async () => {
    renderAt('/ruta')
    const inferior = screen.getByRole('navigation', { name: 'Inferior' })

    await userEvent.click(within(inferior).getByRole('link', { name: 'Granjas' }))

    expect(await screen.findByRole('heading', { name: 'Granjas' })).toBeInTheDocument()
    expect(within(inferior).getByRole('link', { name: 'Granjas' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('abre el catálogo de componentes, que no sale en la navegación', async () => {
    renderAt('/dev/componentes')

    expect(
      await screen.findByRole('heading', { name: 'Catálogo de componentes' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Exposiciones (segura)')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Componentes/ })).not.toBeInTheDocument()
  })
})
