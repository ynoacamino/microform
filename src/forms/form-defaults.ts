import { z } from "zod";

export type ZodObjectSchema = z.ZodObject<z.ZodRawShape>;

interface UnwrappedZodType {
  unwrapped: unknown;
  defaultValue?: unknown;
  isOptional: boolean;
}

interface ZodWrapperDef {
  _def?: {
    typeName?: string;
    defaultValue?: unknown;
    innerType?: unknown;
  };
  unwrap?: () => unknown;
}

function isZodWrapper(value: unknown): value is ZodWrapperDef {
  if (typeof value !== "object" || value === null) return false;
  return "_def" in value || "unwrap" in value;
}

function isEntityRef(value: unknown): value is { id: string } {
  return (
    typeof value === "object" && value !== null && "id" in value && typeof (value as { id: unknown }).id === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Desenvuelve wrappers Zod (Optional/Nullable/Default/Prefault/Effects).
 * `.default()/.prefault()` y `.optional()/.nullish()` → `isOptional: true`.
 * Solo `.nullable()` → sigue siendo requerido (exige valor, aunque sea null).
 */
export function unwrapZodType(type: unknown): UnwrappedZodType {
  let current: unknown = type;
  let defaultValue: unknown;
  let isOptional = false;

  while (isZodWrapper(current)) {
    if (
      current instanceof z.ZodDefault ||
      current._def?.typeName === "ZodDefault" ||
      current instanceof z.ZodPrefault ||
      current._def?.typeName === "ZodPrefault"
    ) {
      isOptional = true;
      const def = current._def;
      defaultValue =
        typeof def?.defaultValue === "function" ? (def.defaultValue as () => unknown)() : def?.defaultValue;
      current = def?.innerType;
    } else if (current instanceof z.ZodOptional || current._def?.typeName === "ZodOptional") {
      isOptional = true;
      current = current._def?.innerType ?? (typeof current.unwrap === "function" ? current.unwrap() : undefined);
    } else if (current instanceof z.ZodNullable || current._def?.typeName === "ZodNullable") {
      current = current._def?.innerType ?? (typeof current.unwrap === "function" ? current.unwrap() : undefined);
    } else if (current._def?.typeName === "ZodEffects") {
      const inner =
        current._def && typeof current._def === "object" && "schema" in current._def
          ? (current._def as { schema?: unknown }).schema
          : undefined;
      if (inner === undefined) break;
      current = inner;
    } else {
      break;
    }
  }

  return { unwrapped: current, defaultValue, isOptional };
}

/**
 * Defaults para formulario de CREACIÓN desde schema Zod:
 * string requerido → "", array → [], boolean → false,
 * optional/default → undefined o el `.default()`, resto → undefined.
 */
export function createFormDefaults<T extends ZodObjectSchema>(schema: T, overrides?: Partial<z.infer<T>>): z.infer<T> {
  const shape = schema.shape;
  const result: Record<string, unknown> = {};

  for (const [key, fieldSchema] of Object.entries(shape)) {
    const { unwrapped, defaultValue, isOptional } = unwrapZodType(fieldSchema);
    const typeName = isZodWrapper(unwrapped) ? unwrapped._def?.typeName : undefined;

    if (defaultValue !== undefined) {
      result[key] = defaultValue;
    } else if (isOptional) {
      result[key] = undefined;
    } else if (unwrapped instanceof z.ZodString || typeName === "ZodString") {
      result[key] = "";
    } else if (unwrapped instanceof z.ZodArray || typeName === "ZodArray") {
      result[key] = [];
    } else if (unwrapped instanceof z.ZodBoolean || typeName === "ZodBoolean") {
      result[key] = false;
    } else {
      result[key] = undefined;
    }
  }

  if (overrides) Object.assign(result, overrides);

  return result as z.infer<T>;
}

/** Mapa `campo → requerido` derivado del schema, sin flags manuales. */
export function buildRequiredMap(schema: ZodObjectSchema): Map<string, boolean> {
  const result = new Map<string, boolean>();
  for (const [key, fieldSchema] of Object.entries(schema.shape)) {
    result.set(key, !unwrapZodType(fieldSchema).isOptional);
  }
  return result;
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

/**
 * Valores iniciales para EDICIÓN desde entidad (ej. GraphQL):
 * ignora `__*`/funciones, `null → undefined`,
 * `entity.structure → structureId`, `entity.modules → moduleIds`.
 */
export function buildEditDefaults<TTarget extends Record<string, unknown>>(
  schema: z.ZodObject<z.ZodRawShape>,
  entity: Record<string, unknown> | null | undefined,
  overrides?: Partial<TTarget>,
): TTarget {
  const schemaDefaults: Record<string, unknown> = {};
  for (const [key, fieldSchema] of Object.entries(schema.shape)) {
    const { defaultValue } = unwrapZodType(fieldSchema);
    if (defaultValue !== undefined) schemaDefaults[key] = defaultValue;
  }

  if (!entity) return { ...schemaDefaults, ...overrides } as TTarget;

  const result: Record<string, unknown> = { ...schemaDefaults };

  for (const [key, value] of Object.entries(entity)) {
    if (key.startsWith("__") || typeof value === "function") continue;

    if (value === null) {
      result[key] = undefined;
    } else if (Array.isArray(value)) {
      if (key in schema.shape && result[key] === undefined) result[key] = value;

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
    } else if (isEntityRef(value)) {
      const relationIdKey = `${key}Id`;
      if (relationIdKey in schema.shape && result[relationIdKey] === undefined) {
        result[relationIdKey] = value.id;
      }
    }
  }

  if (overrides) Object.assign(result, overrides);

  return result as TTarget;
}
