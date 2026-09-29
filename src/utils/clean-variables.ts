/**
 * Limpia variables de query/mutación: `""` (con trim) → `undefined`,
 * recursivo en objetos/arrays. Los arrays vacíos tras limpiar → `undefined`.
 * `null` → `undefined` para consistencia (null → undefined).
 */
export function cleanVariables(val: string): string | undefined;
export function cleanVariables<T>(val: T): T | undefined;
export function cleanVariables(val: unknown): unknown {
  if (val === null || val === undefined) return undefined;
  if (typeof val === "string") {
    return val.trim() === "" ? undefined : val;
  }
  if (Array.isArray(val)) {
    const cleaned = val.map((item) => cleanVariables(item)).filter((item) => item !== undefined);
    return cleaned.length > 0 ? cleaned : undefined;
  }
  if (typeof val === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(val)) {
      const cleaned = cleanVariables(value);
      if (cleaned !== undefined) out[key] = cleaned;
    }
    return Object.keys(out).length > 0 ? out : undefined;
  }
  return val;
}
