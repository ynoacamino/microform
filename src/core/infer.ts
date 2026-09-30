import type { FieldValue } from "@/core/control.ts";

export function inferInputValue(value: FieldValue | unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (Array.isArray(value)) return undefined;
  return String(value);
}
