import type { ButtonHTMLAttributes } from 'react'
import { Spinner } from './Spinner'

type Variante = 'primario' | 'secundario' | 'peligro' | 'fantasma'
type Tamano = 'normal' | 'grande'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variante?: Variante
  /** «grande» es para las acciones de campo (Entrar, Salir), pensadas para usar con guantes. */
  readonly tamano?: Tamano
  /** Mientras carga, el botón se desactiva y enseña un spinner. */
  readonly cargando?: boolean
}

const CLASES_VARIANTE: Readonly<Record<Variante, string>> = {
  primario: 'bg-marca text-white hover:bg-marca-oscura',
  secundario: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-100',
  peligro: 'bg-riesgo-alto text-white hover:brightness-90',
  fantasma: 'text-slate-700 hover:bg-slate-100',
}

const CLASES_TAMANO: Readonly<Record<Tamano, string>> = {
  normal: 'min-h-tactil px-4 text-base',
  grande: 'min-h-16 w-full px-6 text-lg',
}

export function Button({
  variante = 'primario',
  tamano = 'normal',
  cargando = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-marca active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${CLASES_VARIANTE[variante]} ${CLASES_TAMANO[tamano]} ${className}`}
      {...props}
    >
      {cargando && <Spinner decorativo />}
      {children}
    </button>
  )
}
