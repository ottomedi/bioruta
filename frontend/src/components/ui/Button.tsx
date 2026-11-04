import type { ButtonHTMLAttributes } from 'react'
import { Spinner } from './Spinner'

/** «crotal» es la acción principal sobre fondo verde campo, como «Entrar como demo». */
type Variante = 'primario' | 'crotal' | 'secundario' | 'peligro' | 'fantasma'
type Tamano = 'normal' | 'grande'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variante?: Variante
  /** «grande» es para las acciones de campo (Entrar, Salir), pensadas para usar con guantes. */
  readonly tamano?: Tamano
  /** Mientras carga, el botón se desactiva y enseña un spinner. */
  readonly cargando?: boolean
}

const CLASES_VARIANTE: Readonly<Record<Variante, string>> = {
  primario: 'bg-campo text-white shadow-tarjeta hover:bg-campo-claro',
  crotal: 'bg-crotal font-bold text-crotal-tinta shadow-aviso hover:bg-crotal-oscuro',
  secundario:
    'border border-linea bg-superficie text-tinta hover:border-campo hover:bg-campo-suave',
  peligro: 'bg-riesgo-alto text-white shadow-tarjeta hover:brightness-90',
  fantasma: 'text-campo underline-offset-4 hover:bg-campo-suave hover:underline',
}

const CLASES_TAMANO: Readonly<Record<Tamano, string>> = {
  normal: 'min-h-tactil px-4 text-base',
  grande: 'min-h-16 w-full px-6 text-xl',
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
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-[background-color,border-color,filter] duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${CLASES_VARIANTE[variante]} ${CLASES_TAMANO[tamano]} ${className}`}
      {...props}
    >
      {cargando && <Spinner decorativo />}
      {children}
    </button>
  )
}
