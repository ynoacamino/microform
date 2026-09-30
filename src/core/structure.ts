import type { FieldStructure, FieldType } from "./field";
import { isFieldRow } from "./field";

export const MAX_COLUMNS = 12;

export function validateColumns(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= MAX_COLUMNS;
}

export function flattenStructure<T extends string>(structure: FieldStructure<T>): FieldType<T>[] {
  const out: FieldType<T>[] = [];
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
