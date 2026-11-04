import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { handlers } from './mocks/handlers'
import { conSesionDemo, renderApp as renderAt } from './test/renderApp'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// El acceso (login, salir, sesión caducada) se prueba en pages/LoginPage.test.tsx.
describe('rutas', () => {
  beforeEach(() => {
    conSesionDemo()
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
    ['/granjas/6', 'Cebo Los Almendros'],
    ['/granjas/importar', 'Importar fichero'],
    ['/visitas', 'Visitas'],
    ['/trazabilidad', 'Trazabilidad'],
    ['/fuentes', 'De dónde salen las reglas'],
    ['/no-existe', 'Página no encontrada'],
  ])('%s enseña «%s»', async (path, title) => {
    renderAt(path)

    expect(await screen.findByRole('heading', { name: title })).toBeInTheDocument()
  })

  it('la navegación inferior lleva a cada sección y marca la activa', async () => {
    renderAt('/ruta')
    const inferior = await screen.findByRole('navigation', { name: 'Inferior' })

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
