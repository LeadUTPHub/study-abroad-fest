// Alfabeto del código del pasaporte (PLAN.md, sección 2: "8 caracteres
// sin letras confusas: sin 0/O, 1/I/L"). Un solo lugar para que
// scripts/codigos.ts (genera) y src/server/canje.ts (valida) usen
// exactamente el mismo alfabeto.
export const ALFABETO_CODIGO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const LARGO_CUERPO = 8;

const CUERPO_RE = new RegExp(`^[${ALFABETO_CODIGO}]{${LARGO_CUERPO}}$`);

/** El código completo tal como se muestra: "SAF-XXXX-XXXX". */
export function formatearCodigo(cuerpo: string): string {
  return `SAF-${cuerpo.slice(0, 4)}-${cuerpo.slice(4)}`;
}

/** true si `cuerpo` (sin "SAF-" ni guiones) usa solo el alfabeto esperado. */
export function cuerpoValido(cuerpo: string): boolean {
  return CUERPO_RE.test(cuerpo);
}
