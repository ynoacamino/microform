import type { StorageAdapter } from "../adapters/ports.ts";
import type { FieldValue } from "../types/control.ts";

/** Prefijo por defecto de las claves de persistencia. */
const DEFAULT_PREFIX = "form-persist:";

/** Construye la clave de storage: `${prefix}${persistKey}`. */
export function createPersistenceKey(persistKey: string, prefix: string = DEFAULT_PREFIX): string {
  return `${prefix}${persistKey}`;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/**
 * Lee un valor persistido: `get` + `JSON.parse` en try/catch → `undefined`
 * si falta, el JSON está corrupto o el tipo no es `string | number | string[]`
 * (de `string[]` se exige que cada elemento sea `string`).
 */
export function readPersistedValue(
  storage: StorageAdapter,
  persistKey: string,
  prefix: string = DEFAULT_PREFIX,
): string | number | string[] | undefined {
  const raw = storage.get(createPersistenceKey(persistKey, prefix));
  if (raw === null) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (typeof parsed === "string" || typeof parsed === "number") return parsed;
  if (isStringArray(parsed)) return parsed;
  return undefined;
}

/**
 * Persiste con `setItem` en JSON. Omite `File[]` (no serializables),
 * `undefined`/`null` y `""` (vacío sin sentido que ensucia el storage).
 *
 * Detección `File[]` sin importar el lib DOM (core headless): marca
 * estructural — array no vacío cuyo primer elemento es objeto. Cubre `File`
 * reales (`typeof File-instance === "object"`) haya o no `globalThis.File`,
 * y de paso omite cualquier array de objetos, que el lector de todos modos
 * rechazaría (solo acepta `string | number | string[]`).
 */
export function writePersistedValue(
  storage: StorageAdapter,
  persistKey: string,
  value: FieldValue | unknown,
  prefix: string = DEFAULT_PREFIX,
): void {
  if (value === undefined || value === null) return;
  if (value === "") return;
  if (Array.isArray(value) && value.length > 0) {
    const first: unknown = value[0];
    if (typeof first === "object" && first !== null) return;
  }
  const serialized = JSON.stringify(value);
  if (serialized === undefined) return;
  storage.set(createPersistenceKey(persistKey, prefix), serialized);
}
