/**
 * Limpia variables de mutación: `""` con trim → `null` (no `undefined`,
 * porque GraphQL distingue `null` explícito de variable omitida),
 * recursivo en objetos/arrays. `null`/`undefined` se preservan
 * (semántica referencia `form-submit.ts`: `undefined` = omitido,
 * `null` = explícito). Difiere de `cleanVariables` (queries):
 * allí `""` → `undefined`.
 */
export function cleanFormVariables(val: string): string | null;
export function cleanFormVariables<T>(val: T): T;
export function cleanFormVariables(val: unknown): unknown {
  if (val === null || val === undefined) return val;
  if (typeof val === "string") return val.trim() === "" ? null : val;
  if (Array.isArray(val)) return val.map((item) => cleanFormVariables(item));
  if (typeof val === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(val)) {
      if (typeof value === "string" && value.trim() === "") result[key] = null;
      else if (typeof value === "object" && value !== null) result[key] = cleanFormVariables(value);
      else result[key] = value;
    }
    return result;
  }
  return val;
}
