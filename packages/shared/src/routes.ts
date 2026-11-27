/**
 * Pluriel d URL partagé par l API et le bureau, pour que les listes appellent le bon chemin.
 * MAAYOUD
 */

/** Pluriel prévisible, utilisé tel quel dans les URL. */
export function pluralKebab(modelName: string): string {
  const kebab = modelName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  if (kebab.endsWith('sis')) return `${kebab.slice(0, -2)}es`;
  const previous = kebab.charAt(kebab.length - 2);
  if (kebab.endsWith('y') && previous && !'aeiou'.includes(previous)) return `${kebab.slice(0, -1)}ies`;
  if (kebab.endsWith('batch')) return `${kebab}es`;
  return `${kebab}s`;
}
