/** Pasa a minúsculas y quita tildes, para que «binefar» encuentre «Binéfar». */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es')
    .trim()
}
