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

// Solo .nullable() sigue requerido.
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

export function buildRequiredMap(schema: ZodObjectSchema): Map<string, boolean> {
  const result = new Map<string, boolean>();
  for (const [key, fieldSchema] of Object.entries(schema.shape)) {
    result.set(key, !unwrapZodType(fieldSchema).isOptional);
  }
  return result;
}
