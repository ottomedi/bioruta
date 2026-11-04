export const DESTINO_POR_DEFECTO = '/ruta'

/**
 * A dónde ir tras entrar. Solo acepta rutas internas: el estado de navegación
 * puede venir de un enlace ajeno, y «//otro.sitio» o «/\otro.sitio» (el
 * navegador lee la barra invertida como «/») saldrían de la app.
 */
export function destinoTrasEntrar(state: unknown): string {
  const desde = (state as { desde?: unknown } | null)?.desde
  if (
    typeof desde !== 'string' ||
    !desde.startsWith('/') ||
    desde.startsWith('//') ||
    desde.includes('\\')
  ) {
    return DESTINO_POR_DEFECTO
  }
  return desde.startsWith('/login') ? DESTINO_POR_DEFECTO : desde
}
