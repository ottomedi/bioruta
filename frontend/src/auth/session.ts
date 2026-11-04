const TOKEN_KEY = 'bioruta.token'

/*
 * El token va en localStorage: vale para la demo, pero un XSS podría leerlo. En
 * producción iría en una cookie HttpOnly (está en «Supuestos y limitaciones»).
 * Si el navegador no deja guardar (modo privado, almacenamiento bloqueado), la
 * sesión dura lo que la pestaña.
 */

export function leerToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function guardarToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Sin almacenamiento el token sigue en memoria; no hay nada más que hacer.
  }
}

export function borrarToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Igual que arriba: si no se pudo guardar, tampoco hay nada que borrar.
  }
}
