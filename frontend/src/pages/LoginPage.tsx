import { Link } from 'react-router'

/** Entrada a la app. El botón «Entrar como demo» y el formulario llegan el día 3. */
export function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-slate-50 px-4 text-center">
      <h1 className="text-3xl font-bold text-green-800">BioRuta</h1>
      <p className="max-w-sm text-slate-600">
        Rutas de visita entre granjas porcinas ordenadas por riesgo sanitario.
      </p>
      <Link
        to="/ruta"
        className="rounded-lg bg-green-700 px-6 py-3 text-lg font-semibold text-white hover:bg-green-800"
      >
        Entrar
      </Link>
    </main>
  )
}
