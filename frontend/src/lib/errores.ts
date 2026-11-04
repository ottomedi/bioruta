/** Texto para enseñar al usuario. Los errores de la API ya traen su mensaje en español. */
export function mensajeDeError(
  error: unknown,
  porDefecto = 'Ha ocurrido un error inesperado.',
): string {
  return error instanceof Error && error.message ? error.message : porDefecto
}
