import { describe, expect, it } from "vitest";
import { z } from "zod";
import { buildRequiredMap, createFormDefaults, unwrapZodType } from "./zod-defaults";

const schema = z.object({
  name: z.string(),
  nickname: z.string().optional(),
  tags: z.array(z.string()),
  active: z.boolean(),
  role: z.string().default("USER"),
  age: z.number(),
});

describe("createFormDefaults", () => {
  it("infers types", () => {
    const defaults = createFormDefaults(schema);
    expect(defaults.name).toBe("");
    expect(defaults.tags).toEqual([]);
    expect(defaults.active).toBe(false);
    expect(defaults.nickname).toBeUndefined();
    expect(defaults.role).toBe("USER");
    expect(defaults.age).toBeUndefined();
  });

  it("overrides apply", () => {
    const defaults = createFormDefaults(schema, { name: "Ana" });
    expect(defaults.name).toBe("Ana");
  });

  it("covers string/array/boolean and rest → undefined, no overrides", () => {
    const mixed = z.object({
      title: z.string(),
      tags: z.array(z.string()),
      active: z.boolean(),
      count: z.number(),
      meta: z.object({ label: z.string() }),
    });
    const defaults = createFormDefaults(mixed);
    expect(defaults.title).toBe("");
    expect(defaults.tags).toEqual([]);
    expect(defaults.active).toBe(false);
    expect(defaults.count).toBeUndefined();
    expect(defaults.meta).toBeUndefined();
  });

  it("readonly falls to else → undefined (zod v4 does not unwrap it)", () => {
    const readonlySchema = z.object({ name: z.string().readonly() });
    const defaults = createFormDefaults(readonlySchema);
    expect(defaults.name).toBeUndefined();
  });
});

describe("buildRequiredMap", () => {
  it("marks optional/default as not required", () => {
    const map = buildRequiredMap(schema);
    expect(map.get("name")).toBe(true);
    expect(map.get("nickname")).toBe(false);
    expect(map.get("role")).toBe(false);
    expect(map.get("tags")).toBe(true);
  });

  it("bare nullable stays required", () => {
    const s2 = z.object({ a: z.string().nullable(), b: z.string().nullish() });
    const map = buildRequiredMap(s2);
    expect(map.get("a")).toBe(true);
    expect(map.get("b")).toBe(false);
  });
});

describe("unwrapZodType", () => {
  it("default() marks optional and exposes the value", () => {
    const result = unwrapZodType(z.string().default("hi"));
    expect(result.isOptional).toBe(true);
    expect(result.defaultValue).toBe("hi");
    expect(result.unwrapped).toBeInstanceOf(z.ZodString);
  });

  it("prefault() marks optional and exposes the value", () => {
    const result = unwrapZodType(z.string().prefault("pre"));
    expect(result.isOptional).toBe(true);
    expect(result.defaultValue).toBe("pre");
    expect(result.unwrapped).toBeInstanceOf(z.ZodString);
  });

  it("readOnly() is not unwrapped in zod v4 (documented)", () => {
    const readonlyField = z.string().readonly();
    const result = unwrapZodType(readonlyField);
    expect(result.isOptional).toBe(false);
    expect(result.defaultValue).toBeUndefined();
    expect(result.unwrapped).toBe(readonlyField);
  });

  it("refine() returns the same schema (no wrapper in zod v4)", () => {
    const refined = z.string().refine((value) => value.length > 0);
    const result = unwrapZodType(refined);
    expect(result.isOptional).toBe(false);
    expect(result.unwrapped).toBe(refined);
  });

  it("ZodOptional via typeName (compat) unwraps", () => {
    const fakeOptional: unknown = {
      _def: { typeName: "ZodOptional", innerType: z.string() },
    };
    const result = unwrapZodType(fakeOptional);
    expect(result.isOptional).toBe(true);
    expect(result.unwrapped).toBeInstanceOf(z.ZodString);
  });

  it("ZodOptional without innerType uses the unwrap() fallback", () => {
    const fakeOptional: unknown = {
      _def: { typeName: "ZodOptional" },
      unwrap: () => z.string(),
    };
    const result = unwrapZodType(fakeOptional);
    expect(result.isOptional).toBe(true);
    expect(result.unwrapped).toBeInstanceOf(z.ZodString);
  });

  it("nested ZodNullable in optional reaches the inner string", () => {
    const result = unwrapZodType(z.string().nullable().optional());
    expect(result.isOptional).toBe(true);
    expect(result.unwrapped).toBeInstanceOf(z.ZodString);
  });

  it("ZodEffects with schema unwraps", () => {
    const fakeEffects: unknown = {
      _def: { typeName: "ZodEffects", schema: z.string() },
    };
    const result = unwrapZodType(fakeEffects);
    expect(result.isOptional).toBe(false);
    expect(result.unwrapped).toBeInstanceOf(z.ZodString);
  });

  it("ZodEffects without schema is unreachable with real zod (documented)", () => {
    const fakeEffects: unknown = { _def: { typeName: "ZodEffects" } };
    const result = unwrapZodType(fakeEffects);
    expect(result.isOptional).toBe(false);
    expect(result.unwrapped).toBe(fakeEffects);
  });
});
