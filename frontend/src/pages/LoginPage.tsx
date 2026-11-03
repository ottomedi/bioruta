import { Link } from 'react-router'
import { Crotal } from '../components/ui/Crotal'

/** Entrada a la app. El botón «Entrar como demo» y el formulario llegan más adelante. */
export function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-campo px-4 text-center text-white">
      <Crotal tamano="lg">BR</Crotal>
      <h1 className="text-5xl font-bold tracking-tight">BioRuta</h1>
      <p className="max-w-sm text-lg text-white/85">
        Rutas de visita entre granjas porcinas ordenadas por riesgo sanitario.
      </p>
      <Link
        to="/ruta"
        className="inline-flex min-h-16 min-w-56 items-center justify-center rounded-md bg-crotal px-8 text-xl font-bold text-crotal-tinta shadow-aviso transition-colors hover:bg-crotal-oscuro focus-visible:outline-crotal"
      >
        Entrar
      </Link>
    </main>
  )
}
