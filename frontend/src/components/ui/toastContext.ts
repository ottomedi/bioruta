import { createContext, useContext } from 'react'

export type TipoToast = 'exito' | 'error' | 'info'

export interface ToastApi {
  readonly show: (tipo: TipoToast, mensaje: string) => void
}

export const ToastContext = createContext<ToastApi | null>(null)

/** Para enseñar avisos desde cualquier pantalla. Necesita un ToastProvider por encima. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) {
    throw new Error('useToast necesita un <ToastProvider> por encima.')
  }
  return api
}
