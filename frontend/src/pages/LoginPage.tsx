import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../auth/authContext'
import { destinoTrasEntrar } from '../auth/destino'
import { Button } from '../components/ui/Button'
import { Crotal } from '../components/ui/Crotal'

type Accion = 'demo' | 'formulario'

const CAMPO =
  'mt-1 min-h-tactil w-full rounded-md border border-linea bg-superficie px-3 text-base text-tinta'

function mensajeDe(error: unknown): string {
  return error instanceof Error ? error.message : 'No se ha podido entrar. Inténtalo de nuevo.'
}

/**
 * Entrada a la app. El jurado no tiene cuenta: el botón grande entra con el
 * escenario de demo, y el formulario queda debajo para quien sí la tenga.
 */
export function LoginPage() {
  const { estado, entrarComoDemo, iniciarSesion } = useAuth()
  const location = useLocation()
  const [enCurso, setEnCurso] = useState<Accion | null>(null)
  const [error, setError] = useState<string | null>(null)
  const alertaRef = useRef<HTMLParagraphElement>(null)
  const destino = destinoTrasEntrar(location.state)

  // El botón pulsado se desactiva y pierde el foco: tras un fallo, el foco va al mensaje.
  useEffect(() => {
    if (error) alertaRef.current?.focus()
  }, [error])

  // Con sesión abierta (recién entrado o ya guardada) no hay nada que hacer aquí.
  if (estado.kind === 'con_sesion') {
    return <Navigate to={destino} replace />
  }

  const mensaje = error ?? (estado.kind === 'sin_sesion' ? estado.aviso : undefined)

  async function entrar(accion: Accion, hacer: () => Promise<void>) {
    setEnCurso(accion)
    setError(null)
    try {
      await hacer()
    } catch (e: unknown) {
      setError(mensajeDe(e))
    } finally {
      setEnCurso(null)
    }
  }

  function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const datos = new FormData(event.currentTarget)
    const credenciales = {
      email: String(datos.get('email') ?? '').trim(),
      password: String(datos.get('password') ?? ''),
    }
    void entrar('formulario', () => iniciarSesion(credenciales))
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-campo px-4 py-10 text-white">
      <title>Entrar · BioRuta</title>
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <Crotal tamano="lg">BR</Crotal>
        <h1 className="text-5xl font-bold tracking-tight">BioRuta</h1>
        <p className="text-lg text-white/85">
          Rutas de visita entre granjas porcinas ordenadas por riesgo sanitario.
        </p>

        <div className="w-full">
          <Button
            variante="crotal"
            tamano="grande"
            cargando={enCurso === 'demo'}
            disabled={enCurso !== null}
            onClick={() => void entrar('demo', entrarComoDemo)}
            className="focus-visible:outline-crotal"
          >
            Entrar como demo
          </Button>
          <p className="mt-2 text-sm text-white/75">
            Sin registro. Abre la app con granjas de ejemplo de La Litera (Huesca).
          </p>
        </div>

        {mensaje && (
          <p
            ref={alertaRef}
            role="alert"
            tabIndex={-1}
            className="w-full rounded-md bg-riesgo-alto-suave px-3 py-2 text-left text-riesgo-alto focus-visible:outline-crotal"
          >
            {mensaje}
          </p>
        )}

        <form
          onSubmit={enviarFormulario}
          aria-label="Entrar con tu cuenta"
          className="w-full rounded-lg bg-superficie p-4 text-left text-tinta shadow-tarjeta"
        >
          <h2 className="mb-3 text-base font-semibold">O entra con tu cuenta</h2>
          <label className="mb-3 block text-sm font-medium">
            Email
            <input name="email" type="email" required autoComplete="username" className={CAMPO} />
          </label>
          <label className="mb-4 block text-sm font-medium">
            Contraseña
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={CAMPO}
            />
          </label>
          <Button
            type="submit"
            cargando={enCurso === 'formulario'}
            disabled={enCurso !== null}
            className="w-full"
          >
            Entrar
          </Button>
        </form>
      </div>
    </main>
  )
}
