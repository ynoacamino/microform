import type { FieldStructure, FieldType, StructureNode } from "./field";
import { isFieldRow, isFieldSection } from "./field";

export const MAX_COLUMNS = 12;

export function validateColumns(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= MAX_COLUMNS;
}

export function flattenStructure<T extends string>(structure: FieldStructure<T>): FieldType<T>[] {
  const out: FieldType<T>[] = [];
  const visit = (nodes: StructureNode<T>[]): void => {
    for (const item of nodes) {
      if (isFieldSection(item)) {
        visit(item.children);
      } else if (isFieldRow(item)) {
        for (const field of item.fields) {
          out.push(field);
        }
      } else {
        out.push(item);
      }
    }
  };
  visit(structure);
  return out;
}

/**
 * Headless structural validation. Returns human-readable errors
 * (empty = valid). Checks columns range, colspan range + colspan<=columns,
 * non-empty rows/sections. Duplicate names are NOT errors (same field may
 * appear once; adapters may warn separately).
 */
export function validateStructure<T extends string>(structure: FieldStructure<T>): string[] {
  const errors: string[] = [];
  const visit = (nodes: StructureNode<T>[], path: string): void => {
    nodes.forEach((item, index) => {
      const at = `${path}[${index}]`;
      if (isFieldSection(item)) {
        if (item.children.length === 0) errors.push(`${at}: empty section`);
        visit(item.children, `${at}.children`);
        return;
      }
      if (isFieldRow(item)) {
        if (!validateColumns(item.columns)) {
          errors.push(`${at}: columns ${item.columns} out of range 1..${MAX_COLUMNS}`);
        }
        if (item.fields.length === 0) errors.push(`${at}: empty row`);
        for (const field of item.fields) {
          const span = field.colspan ?? 1;
          if (!validateColumns(span)) {
            errors.push(`${at}.${field.name}: colspan ${span} out of range 1..${MAX_COLUMNS}`);
          } else if (validateColumns(item.columns) && span > item.columns) {
            errors.push(`${at}.${field.name}: colspan ${span} exceeds columns ${item.columns}`);
          }
        }
        return;
      }
    });
  };
  visit(structure, "structure");
  return errors;
}
