import type { FieldValue } from "@/core/control.ts";
import type { StorageAdapter } from "@/data/ports.ts";

const DEFAULT_PREFIX = "form-persist:";

export function createPersistenceKey(persistKey: string, prefix: string = DEFAULT_PREFIX): string {
  return `${prefix}${persistKey}`;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

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

// Omite FileLike (no serializable) por marca estructural: array no vacío
// cuyo primer elemento es objeto. Sin lib DOM; el lector rechazaría
// arrays de objetos de todos modos.
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
