import { describe, expect, it } from "vitest";
import { z } from "zod";
import { buildEditDefaults, buildRequiredMap, createFormDefaults, unwrapZodType } from "./form-defaults.ts";

const schema = z.object({
  name: z.string(),
  nickname: z.string().optional(),
  tags: z.array(z.string()),
  active: z.boolean(),
  role: z.string().default("USER"),
  age: z.number(),
});

describe("form-defaults", () => {
  it("createFormDefaults deduce tipos", () => {
    const defaults = createFormDefaults(schema);
    expect(defaults.name).toBe("");
    expect(defaults.tags).toEqual([]);
    expect(defaults.active).toBe(false);
    expect(defaults.nickname).toBeUndefined();
    expect(defaults.role).toBe("USER");
    expect(defaults.age).toBeUndefined();
  });

  it("overrides se aplican", () => {
    const defaults = createFormDefaults(schema, { name: "Ana" });
    expect(defaults.name).toBe("Ana");
  });

  it("buildRequiredMap marca optional/default como no requeridos", () => {
    const map = buildRequiredMap(schema);
    expect(map.get("name")).toBe(true);
    expect(map.get("nickname")).toBe(false);
    expect(map.get("role")).toBe(false);
    expect(map.get("tags")).toBe(true);
  });

  it("nullable solo sigue siendo requerido", () => {
    const s2 = z.object({ a: z.string().nullable(), b: z.string().nullish() });
    const map = buildRequiredMap(s2);
    expect(map.get("a")).toBe(true);
    expect(map.get("b")).toBe(false);
  });

  it("buildEditDefaults limpia __typename/null y mapea relaciones", () => {
    const editSchema = z.object({
      name: z.string(),
      structureId: z.string().optional(),
      moduleIds: z.array(z.string()).optional(),
    });
    const entity = {
      __typename: "Student",
      name: "Luis",
      nick: null,
      structure: { id: "s-1" },
      modules: [{ id: "m-1" }, { id: "m-2" }],
    };
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, entity);
    expect(out.__typename).toBeUndefined();
    expect(out.name).toBe("Luis");
    expect(out.structureId).toBe("s-1");
    expect(out.moduleIds).toEqual(["m-1", "m-2"]);
  });
});

describe("unwrapZodType", () => {
  it("default() marca opcional y expone el valor", () => {
    const result = unwrapZodType(z.string().default("hi"));
    expect(result.isOptional).toBe(true);
    expect(result.defaultValue).toBe("hi");
    expect(result.unwrapped).toBeInstanceOf(z.ZodString);
  });

  it("prefault() marca opcional y expone el valor", () => {
    const result = unwrapZodType(z.string().prefault("pre"));
    expect(result.isOptional).toBe(true);
    expect(result.defaultValue).toBe("pre");
    expect(result.unwrapped).toBeInstanceOf(z.ZodString);
  });

  it("readOnly() no se desenvuelve en zod v4 (se documenta)", () => {
    const readonlyField = z.string().readonly();
    const result = unwrapZodType(readonlyField);
    expect(result.isOptional).toBe(false);
    expect(result.defaultValue).toBeUndefined();
    expect(result.unwrapped).toBe(readonlyField);
  });

  it("refine() devuelve el mismo schema (sin wrapper en zod v4)", () => {
    const refined = z.string().refine((value) => value.length > 0);
    const result = unwrapZodType(refined);
    expect(result.isOptional).toBe(false);
    expect(result.unwrapped).toBe(refined);
  });

  it("ZodOptional vía typeName (compat) se desenvuelve", () => {
    const fakeOptional: unknown = {
      _def: { typeName: "ZodOptional", innerType: z.string() },
    };
    const result = unwrapZodType(fakeOptional);
    expect(result.isOptional).toBe(true);
    expect(result.unwrapped).toBeInstanceOf(z.ZodString);
  });

  it("ZodOptional sin innerType usa el fallback unwrap()", () => {
    const fakeOptional: unknown = {
      _def: { typeName: "ZodOptional" },
      unwrap: () => z.string(),
    };
    const result = unwrapZodType(fakeOptional);
    expect(result.isOptional).toBe(true);
    expect(result.unwrapped).toBeInstanceOf(z.ZodString);
  });

  it("ZodNullable anidado en optional llega al string interno", () => {
    const result = unwrapZodType(z.string().nullable().optional());
    expect(result.isOptional).toBe(true);
    expect(result.unwrapped).toBeInstanceOf(z.ZodString);
  });

  it("ZodEffects con schema se desenvuelve", () => {
    const fakeEffects: unknown = {
      _def: { typeName: "ZodEffects", schema: z.string() },
    };
    const result = unwrapZodType(fakeEffects);
    expect(result.isOptional).toBe(false);
    expect(result.unwrapped).toBeInstanceOf(z.ZodString);
  });

  it("ZodEffects sin schema es inalcanzable con zod real (se documenta)", () => {
    const fakeEffects: unknown = { _def: { typeName: "ZodEffects" } };
    const result = unwrapZodType(fakeEffects);
    expect(result.isOptional).toBe(false);
    expect(result.unwrapped).toBe(fakeEffects);
  });
});

describe("createFormDefaults ramas", () => {
  it("cubre string/array/boolean y resto → undefined, sin overrides", () => {
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

  it("readonly cae en else → undefined (zod v4 no lo desenvuelve)", () => {
    const readonlySchema = z.object({ name: z.string().readonly() });
    const defaults = createFormDefaults(readonlySchema);
    expect(defaults.name).toBeUndefined();
  });
});

describe("buildEditDefaults casos borde", () => {
  const editSchema = z.object({
    name: z.string(),
    nickname: z.string().optional(),
    structureId: z.string().optional(),
    moduleIds: z.array(z.string()).optional(),
    companyIds: z.array(z.string()).optional(),
    userIds: z.array(z.string()).optional(),
    role: z.string().default("USER"),
  });

  it("entity null/undefined devuelve defaults del schema y acepta overrides", () => {
    const fromNull = buildEditDefaults<Record<string, unknown>>(editSchema, null);
    expect(fromNull.role).toBe("USER");
    expect(fromNull.name).toBeUndefined();
    const fromUndefined = buildEditDefaults<Record<string, unknown>>(editSchema, undefined);
    expect(fromUndefined.role).toBe("USER");
    const withOverrides = buildEditDefaults<Record<string, unknown>>(editSchema, null, { name: "Ana" });
    expect(withOverrides.name).toBe("Ana");
    expect(withOverrides.role).toBe("USER");
  });

  it("ignora claves __* y funciones; null → undefined", () => {
    const entity: Record<string, unknown> = {
      __typename: "Student",
      __meta: 1,
      name: "Luis",
      nickname: null,
      onSave: () => {},
    };
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, entity);
    expect(out.__typename).toBeUndefined();
    expect(out.__meta).toBeUndefined();
    expect(out.onSave).toBeUndefined();
    expect(out.nickname).toBeUndefined();
    expect(out.name).toBe("Luis");
  });

  it("array con key en shape conserva el valor crudo", () => {
    const tagged = z.object({ tags: z.array(z.string()).optional() });
    const out = buildEditDefaults<Record<string, unknown>>(tagged, { tags: ["a", "b"] });
    expect(out.tags).toEqual(["a", "b"]);
  });

  it("plural ies → y (companies → companyIds)", () => {
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, {
      companies: [{ id: "c-1" }, { id: "c-2" }],
    });
    expect(out.companyIds).toEqual(["c-1", "c-2"]);
  });

  it("plural s → singular (users → userIds)", () => {
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, {
      users: [{ id: "u-1" }],
    });
    expect(out.userIds).toEqual(["u-1"]);
  });

  it("extractIds acepta strings, numbers y {id} directos", () => {
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, {
      modules: ["m-1", 42, { id: "m-2" }],
    });
    expect(out.moduleIds).toEqual(["m-1", "42", "m-2"]);
  });

  it("ref anidada dentro del objeto aporta su id", () => {
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, {
      modules: [{ module: { id: "m-5" } }],
    });
    expect(out.moduleIds).toEqual(["m-5"]);
  });

  it("arreglo con id propio aporta su id (líneas 130-131)", () => {
    const item: unknown = Object.assign(["m-x"], { id: "arr-1" });
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, { modules: [item] });
    expect(out.moduleIds).toEqual(["arr-1"]);
  });

  it("relationIdsKey ya definido como escalar no se sobreescribe", () => {
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, {
      moduleIds: "m-9",
      modules: [{ id: "m-1" }],
    });
    expect(out.moduleIds).toBe("m-9");
  });

  it("ids vacíos no escriben la clave", () => {
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, { modules: [] });
    expect("moduleIds" in out).toBe(false);
  });

  it("escalar directo se asigna y overrides ganan", () => {
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, { name: "Luis" }, { name: "Ana" });
    expect(out.name).toBe("Ana");
  });

  it("objeto {id} con relationIdKey fuera del shape no asigna", () => {
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, { team: { id: "t-1" } });
    expect("teamId" in out).toBe(false);
    expect("team" in out).toBe(false);
  });

  it("objeto plano sin id no asigna nada", () => {
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, { address: { street: "x" } });
    expect("address" in out).toBe(false);
  });
});
