/**
 * Resuelve la etiqueta visible para un valor de enum.
 * Retorna el valor cuando el registro no tiene etiqueta.
 */
export function getOptionLabel(labels: Record<string, string>, value: string): string {
  return labels[value] ?? value;
}
