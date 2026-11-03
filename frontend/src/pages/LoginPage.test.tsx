import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { guardarToken, leerToken } from '../auth/session'
import { API_URL } from '../config'
import { TOKEN_DEMO, USUARIO_DEMO } from '../mocks/fixtures'
import { handlers } from '../mocks/handlers'
import { conSesionDemo, renderApp } from '../test/renderApp'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('acceso a la app', () => {
  it('sin sesión, una pantalla protegida manda al login', async () => {
    const router = renderApp('/granjas')

    expect(await screen.findByRole('button', { name: 'Entrar como demo' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('«Entrar como demo» guarda la sesión y abre la ruta del día', async () => {
    renderApp('/login')

    await userEvent.click(await screen.findByRole('button', { name: 'Entrar como demo' }))

    expect(await screen.findByRole('heading', { name: 'Ruta del día' })).toBeInTheDocument()
    expect(leerToken()).toBe(TOKEN_DEMO)
  })

  it('tras entrar vuelve a la pantalla que se había pedido', async () => {
    const router = renderApp('/trazabilidad')

    await userEvent.click(await screen.findByRole('button', { name: 'Entrar como demo' }))

    expect(await screen.findByRole('heading', { name: 'Trazabilidad' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/trazabilidad')
  })

  it('entra con el formulario y una cuenta válida', async () => {
    renderApp('/login')
    const form = await screen.findByRole('form', { name: 'Entrar con tu cuenta' })

    await userEvent.type(within(form).getByLabelText('Email'), USUARIO_DEMO.email)
    await userEvent.type(within(form).getByLabelText('Contraseña'), 'lo-que-sea')
    await userEvent.click(within(form).getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('heading', { name: 'Ruta del día' })).toBeInTheDocument()
  })

  it('enseña el mensaje del backend si la cuenta no vale', async () => {
    renderApp('/login')
    const form = await screen.findByRole('form', { name: 'Entrar con tu cuenta' })

    await userEvent.type(within(form).getByLabelText('Email'), 'otra@example.com')
    await userEvent.type(within(form).getByLabelText('Contraseña'), 'mala')
    await userEvent.click(within(form).getByRole('button', { name: 'Entrar' }))

    // Hay otra región «alert» (la de los avisos): se busca el mensaje por su texto.
    expect(await screen.findByText('Email o contraseña incorrectos.')).toHaveAttribute(
      'role',
      'alert',
    )
    expect(leerToken()).toBeNull()
  })

  it('avisa si el servidor no responde', async () => {
    server.use(http.post(`${API_URL}/auth/demo`, () => HttpResponse.error()))
    renderApp('/login')

    await userEvent.click(await screen.findByRole('button', { name: 'Entrar como demo' }))

    expect(await screen.findByText('No se ha podido conectar con el servidor.')).toHaveAttribute(
      'role',
      'alert',
    )
  })

  it('con una sesión guardada entra directo, y «Salir» la cierra', async () => {
    conSesionDemo()
    const router = renderApp('/visitas')

    await userEvent.click(await screen.findByRole('button', { name: 'Salir' }))

    expect(await screen.findByRole('button', { name: 'Entrar como demo' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(leerToken()).toBeNull()
  })

  it('una sesión caducada (401) vuelve al login y borra el token', async () => {
    server.use(
      http.get(`${API_URL}/auth/me`, () =>
        HttpResponse.json({ codigo: 'no_autorizado', mensaje: 'Caducado.' }, { status: 401 }),
      ),
    )
    conSesionDemo()
    renderApp('/granjas')

    expect(await screen.findByRole('button', { name: 'Entrar como demo' })).toBeInTheDocument()
    expect(leerToken()).toBeNull()
  })

  it('entrar mientras se comprueba un token viejo no deja que su 401 cierre la sesión nueva', async () => {
    server.use(
      http.get(`${API_URL}/auth/me`, async ({ request }) => {
        if (request.headers.get('Authorization') !== 'Bearer token-viejo') return undefined
        await delay(150)
        return HttpResponse.json({ codigo: 'no_autorizado', mensaje: 'Caducado.' }, { status: 401 })
      }),
    )
    guardarToken('token-viejo')
    renderApp('/login')

    await userEvent.click(await screen.findByRole('button', { name: 'Entrar como demo' }))
    expect(await screen.findByRole('heading', { name: 'Ruta del día' })).toBeInTheDocument()
    await new Promise((resolve) => setTimeout(resolve, 300))

    expect(screen.getByRole('heading', { name: 'Ruta del día' })).toBeInTheDocument()
    expect(leerToken()).toBe(TOKEN_DEMO)
  })

  it('si el servidor no responde al arrancar, avisa y conserva el token', async () => {
    server.use(http.get(`${API_URL}/auth/me`, () => HttpResponse.error()))
    conSesionDemo()
    renderApp('/granjas')

    expect(
      await screen.findByText(/No se ha podido comprobar la sesión guardada/),
    ).toBeInTheDocument()
    expect(leerToken()).toBe(TOKEN_DEMO)
  })

  it('tras un fallo, el foco pasa al mensaje de error', async () => {
    renderApp('/login')
    const form = await screen.findByRole('form', { name: 'Entrar con tu cuenta' })

    await userEvent.type(within(form).getByLabelText('Email'), 'otra@example.com')
    await userEvent.type(within(form).getByLabelText('Contraseña'), 'mala')
    await userEvent.click(within(form).getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Email o contraseña incorrectos.')).toHaveFocus()
  })

  it('desde el login con sesión ya abierta pasa a la app', async () => {
    conSesionDemo()
    renderApp('/login')

    expect(await screen.findByRole('heading', { name: 'Ruta del día' })).toBeInTheDocument()
  })
})
