import { CircleAlert, CircleCheck, Info, X, type LucideIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type TipoToast } from './toastContext'

/** Tiempo que se ve un aviso de éxito o información antes de cerrarse solo. */
export const TOAST_MS = 5000
/** Si se acumulan más, se descartan los más antiguos. */
export const MAX_TOASTS = 4

interface Toast {
  readonly id: number
  readonly tipo: TipoToast
  readonly mensaje: string
}

const ESTILO_TIPO: Readonly<Record<TipoToast, { clases: string; icono: LucideIcon }>> = {
  exito: { clases: 'border-riesgo-bajo bg-riesgo-bajo-suave text-riesgo-bajo', icono: CircleCheck },
  error: { clases: 'border-riesgo-alto bg-riesgo-alto-suave text-riesgo-alto', icono: CircleAlert },
  info: { clases: 'border-linea bg-superficie text-tinta', icono: Info },
}

/**
 * Los errores no se cierran solos: con guantes o al sol es fácil no leerlos a
 * tiempo. Los avisos van dentro de regiones vivas que existen desde el principio,
 * porque muchos lectores de pantalla no anuncian una región que aparece ya llena.
 */
export function ToastProvider({ children }: { readonly children: ReactNode }) {
  const [toasts, setToasts] = useState<readonly Toast[]>([])
  const nextId = useRef(1)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const close = useCallback((id: number) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((actuales) => actuales.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (tipo: TipoToast, mensaje: string) => {
      const id = nextId.current++
      setToasts((actuales) => [...actuales, { id, tipo, mensaje }].slice(-MAX_TOASTS))
      if (tipo !== 'error') {
        timers.current.set(
          id,
          setTimeout(() => close(id), TOAST_MS),
        )
      }
    },
    [close],
  )

  useEffect(() => {
    const pendientes = timers.current
    return () => pendientes.forEach(clearTimeout)
  }, [])

  const api = useMemo(() => ({ show }), [show])
  const errores = toasts.filter((t) => t.tipo === 'error')
  const resto = toasts.filter((t) => t.tipo !== 'error')

  return (
    <ToastContext value={api}>
      {children}
      {/* Encima de la navegación inferior en móvil. Sin eventos de puntero en el
          contenedor, para no tapar los toques en la barra que queda debajo. */}
      <div className="pointer-events-none fixed inset-x-4 bottom-20 z-20 flex flex-col items-center gap-2 md:bottom-4">
        <div role="alert" className="contents">
          {errores.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={close} />
          ))}
        </div>
        <div role="status" className="contents">
          {resto.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={close} />
          ))}
        </div>
      </div>
    </ToastContext>
  )
}

interface ToastItemProps {
  readonly toast: Toast
  readonly onClose: (id: number) => void
}

function ToastItem({ toast: { id, tipo, mensaje }, onClose }: ToastItemProps) {
  const { clases, icono: Icono } = ESTILO_TIPO[tipo]
  return (
    <div
      className={`pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-lg border-2 py-1 pr-1 pl-3 font-medium shadow-aviso ${clases}`}
    >
      <Icono aria-hidden className="size-5 shrink-0" />
      <span className="flex-1">{mensaje}</span>
      <button
        type="button"
        onClick={() => onClose(id)}
        aria-label="Cerrar aviso"
        className="inline-flex size-tactil items-center justify-center rounded-md hover:bg-black/5"
      >
        <X aria-hidden className="size-5" />
      </button>
    </div>
  )
}
