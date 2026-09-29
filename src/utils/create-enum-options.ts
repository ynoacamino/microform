export interface SelectOption<T extends string = string> {
  key: string;
  value: T;
  label: string;
}

/**
 * Firma pública: exige genérico explícito. Sin él (`T = never`), el
 * parámetro se vuelve un mensaje de error legible en lugar de inferir
 * silenciosamente `string`.
 */
export function createEnumOptions<T extends string = never>(
  labels: [T] extends [never] ? "You must provide an explicit generic type argument" : Record<NoInfer<T>, string>,
): SelectOption<T>[];
/**
 * Implementación: trabaja en tierra de `string` (lo único que
 * `Object.keys` puede probar), sin assertions. La firma pública de arriba
 * es la que ven los call sites; esta solo existe para el cuerpo.
 */
export function createEnumOptions(labels: Record<string, string>): SelectOption<string>[] {
  const values = Object.keys(labels);
  return values.map((value) => ({
    key: value.toLowerCase(),
    value,
    label: labels[value] ?? value,
  }));
}
