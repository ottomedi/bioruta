import { setupWorker } from 'msw/browser'
import { API_URL } from '../config'
import { handlers } from './handlers'

function esDeLaApi(frame: { readonly protocol: string; readonly data: unknown }): boolean {
  if (frame.protocol !== 'http') return false
  const { request } = frame.data as { readonly request: Request }
  return request.url.startsWith(API_URL)
}

/**
 * El navegador para el service worker cuando lleva un rato sin actividad. Al
 * arrancar de nuevo, MSW ya no recuerda esta pestaña y deja pasar todo a la red.
 * Su aviso periódico lo evita, pero con la pestaña oculta el navegador lo
 * ralentiza. Al volver a la pestaña se repite el aviso con el que MSW se activa;
 * si el worker seguía vivo, repetirlo no cambia nada.
 */
function reactivarAlVolver(): void {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      navigator.serviceWorker.controller?.postMessage('MOCK_ACTIVATE')
    }
  })
}

/**
 * Arranca los mocks en el navegador. Las peticiones a otros sitios (teselas del
 * mapa, fuentes) salen a la red. Una petición a la API sin handler da error, para
 * que se note que falta el mock en vez de llamar al backend real sin querer.
 */
export async function startMocks(): Promise<void> {
  await setupWorker(...handlers).start({
    onUnhandledFrame: ({ frame, defaults }) => {
      if (esDeLaApi(frame)) defaults.error()
    },
  })
  reactivarAlVolver()
}
