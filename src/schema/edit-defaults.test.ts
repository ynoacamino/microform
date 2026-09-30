import { describe, expect, it } from "vitest";
import { z } from "zod";
import { buildEditDefaults } from "@/schema/edit-defaults.ts";

const editSchema = z.object({
  name: z.string(),
  nickname: z.string().optional(),
  structureId: z.string().optional(),
  moduleIds: z.array(z.string()).optional(),
  companyIds: z.array(z.string()).optional(),
  userIds: z.array(z.string()).optional(),
  role: z.string().default("USER"),
});

describe("buildEditDefaults", () => {
  it("cleans __typename/null and maps relations", () => {
    const schema = z.object({
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
    const out = buildEditDefaults<Record<string, unknown>>(schema, entity);
    expect(out.__typename).toBeUndefined();
    expect(out.name).toBe("Luis");
    expect(out.structureId).toBe("s-1");
    expect(out.moduleIds).toEqual(["m-1", "m-2"]);
  });

  it("null/undefined entity returns schema defaults and accepts overrides", () => {
    const fromNull = buildEditDefaults<Record<string, unknown>>(editSchema, null);
    expect(fromNull.role).toBe("USER");
    expect(fromNull.name).toBeUndefined();
    const fromUndefined = buildEditDefaults<Record<string, unknown>>(editSchema, undefined);
    expect(fromUndefined.role).toBe("USER");
    const withOverrides = buildEditDefaults<Record<string, unknown>>(editSchema, null, { name: "Ana" });
    expect(withOverrides.name).toBe("Ana");
    expect(withOverrides.role).toBe("USER");
  });

  it("ignores __* keys and functions; null → undefined", () => {
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

  it("array with key in shape keeps the raw value", () => {
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

  it("extractIds accepts direct strings, numbers and {id}", () => {
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, {
      modules: ["m-1", 42, { id: "m-2" }],
    });
    expect(out.moduleIds).toEqual(["m-1", "42", "m-2"]);
  });

  it("nested ref inside the object provides its id", () => {
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, {
      modules: [{ module: { id: "m-5" } }],
    });
    expect(out.moduleIds).toEqual(["m-5"]);
  });

  it("array with own id provides its id", () => {
    const item: unknown = Object.assign(["m-x"], { id: "arr-1" });
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, { modules: [item] });
    expect(out.moduleIds).toEqual(["arr-1"]);
  });

  it("relationIdsKey already defined as scalar is not overwritten", () => {
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, {
      moduleIds: "m-9",
      modules: [{ id: "m-1" }],
    });
    expect(out.moduleIds).toBe("m-9");
  });

  it("empty ids do not write the key", () => {
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, { modules: [] });
    expect("moduleIds" in out).toBe(false);
  });

  it("direct scalar is assigned and overrides win", () => {
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, { name: "Luis" }, { name: "Ana" });
    expect(out.name).toBe("Ana");
  });

  it("{id} object with relationIdKey outside the shape assigns nothing", () => {
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, { team: { id: "t-1" } });
    expect("teamId" in out).toBe(false);
    expect("team" in out).toBe(false);
  });

  it("plain object without id assigns nothing", () => {
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, { address: { street: "x" } });
    expect("address" in out).toBe(false);
  });

  it("explicit relations map entity-key → schema-key", () => {
    const out = buildEditDefaults<Record<string, unknown>>(editSchema, { modules: [{ id: "m-1" }] }, undefined, {
      relations: { modules: "moduleIds" },
    });
    expect(out.moduleIds).toEqual(["m-1"]);
  });
});
