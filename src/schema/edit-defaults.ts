import type { z } from "zod";
import { unwrapZodType } from "./zod-defaults";

function isEntityRef(value: unknown): value is { id: string } {
  return (
    typeof value === "object" && value !== null && "id" in value && typeof (value as { id: unknown }).id === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractIdsFromArray(items: unknown[], singularKey: string): string[] {
  const ids: string[] = [];
  for (const item of items) {
    if (typeof item === "string") ids.push(item);
    else if (typeof item === "number") ids.push(String(item));
    else if (isRecord(item)) {
      const nested = [item[singularKey], ...Object.values(item)].find(
        (candidate): candidate is { id: string } => candidate !== item && isEntityRef(candidate),
      );
      if (nested) ids.push(nested.id);
      else if (isEntityRef(item)) ids.push(item.id);
    } else if (isEntityRef(item)) {
      ids.push(item.id);
    }
  }
  return ids;
}

export { extractIdsFromArray };

export interface EditDefaultsOptions {
  relations?: Record<string, string>;
  omitKeys?: string[];
  idKey?: string;
}

// Deriva <singular>Ids por heurística plural→singular más relations explícitas.
export function buildEditDefaults<TTarget extends Record<string, unknown>>(
  schema: z.ZodObject<z.ZodRawShape>,
  entity: Record<string, unknown> | null | undefined,
  overrides?: Partial<TTarget>,
  options?: EditDefaultsOptions,
): TTarget {
  const relations = options?.relations ?? {};
  const omitKeys = options?.omitKeys ?? ["__typename"];
  const idKey = options?.idKey ?? "id";
  const omit = new Set(omitKeys);

  const schemaDefaults: Record<string, unknown> = {};
  for (const [key, fieldSchema] of Object.entries(schema.shape)) {
    const { defaultValue } = unwrapZodType(fieldSchema);
    if (defaultValue !== undefined) schemaDefaults[key] = defaultValue;
  }

  if (!entity) return { ...schemaDefaults, ...overrides } as TTarget;

  const result: Record<string, unknown> = { ...schemaDefaults };

  for (const [key, value] of Object.entries(entity)) {
    if (key.startsWith("__") || omit.has(key) || typeof value === "function") continue;

    if (value === null) {
      result[key] = undefined;
    } else if (Array.isArray(value)) {
      if (key in schema.shape && result[key] === undefined) result[key] = value;

      const mapped = relations[key];
      if (mapped && mapped in schema.shape) {
        const ids = extractIdsFromArray(value, key);
        if (ids.length > 0) {
          result[mapped] = ids;
          continue;
        }
      }

      let singularKey = key;
      if (key.endsWith("ies")) singularKey = `${key.slice(0, -3)}y`;
      else if (key.endsWith("s")) singularKey = key.slice(0, -1);

      for (const relationIdsKey of [`${singularKey}Ids`, `${key}Ids`]) {
        if (
          relationIdsKey in schema.shape &&
          (result[relationIdsKey] === undefined || Array.isArray(result[relationIdsKey]))
        ) {
          const ids = extractIdsFromArray(value, singularKey);
          if (ids.length > 0) {
            result[relationIdsKey] = ids;
            break;
          }
        }
      }
    } else if (typeof value !== "object") {
      result[key] = value;
    } else if (isRecord(value) && idKey in value && typeof value[idKey] === "string") {
      const relationIdKey = `${key}Id`;
      if (relationIdKey in schema.shape && result[relationIdKey] === undefined) {
        result[relationIdKey] = value[idKey];
      }
    }
  }

  if (overrides) Object.assign(result, overrides);

  return result as TTarget;
}
