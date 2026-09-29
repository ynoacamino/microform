import type { FieldStructure, FieldType } from "../types/field.ts";
import { isFieldRow } from "../types/field.ts";

export const MAX_COLUMNS = 12;

export function validateColumns(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= MAX_COLUMNS;
}

export function flattenStructure(structure: FieldStructure<string>): FieldType<string>[] {
  const out: FieldType<string>[] = [];
  for (const item of structure) {
    if (isFieldRow(item)) {
      for (const field of item.fields) {
        out.push(field);
      }
    } else {
      out.push(item);
    }
  }
  return out;
}
