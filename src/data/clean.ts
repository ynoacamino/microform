// "omit" (default): "" → undefined. "null": "" → null (mutaciones GraphQL).
export type EmptyStrategy = "omit" | "null";

export function cleanVars(val: string, opts?: { empty?: EmptyStrategy }): string | undefined | null;
export function cleanVars<T>(val: T, opts?: { empty?: EmptyStrategy }): T | undefined;
export function cleanVars(val: unknown, opts?: { empty?: EmptyStrategy }): unknown {
  const empty = opts?.empty ?? "omit";
  if (empty === "null") return cleanNull(val);
  return cleanOmit(val);
}

function cleanOmit(val: unknown): unknown {
  if (val === null || val === undefined) return undefined;
  if (typeof val === "string") {
    return val.trim() === "" ? undefined : val;
  }
  if (Array.isArray(val)) {
    const cleaned = val.map((item) => cleanOmit(item)).filter((item) => item !== undefined);
    return cleaned.length > 0 ? cleaned : undefined;
  }
  if (typeof val === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(val)) {
      const cleaned = cleanOmit(value);
      if (cleaned !== undefined) out[key] = cleaned;
    }
    return Object.keys(out).length > 0 ? out : undefined;
  }
  return val;
}

function cleanNull(val: unknown): unknown {
  if (val === null || val === undefined) return val;
  if (typeof val === "string") return val.trim() === "" ? null : val;
  if (Array.isArray(val)) return val.map((item) => cleanNull(item));
  if (typeof val === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(val)) {
      if (typeof value === "string" && value.trim() === "") result[key] = null;
      else if (typeof value === "object" && value !== null) result[key] = cleanNull(value);
      else result[key] = value;
    }
    return result;
  }
  return val;
}
