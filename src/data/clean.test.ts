import { describe, expect, it } from "vitest";
import { cleanVars } from "@/data/clean.ts";

describe("cleanVars omit (queries)", () => {
  it('"", whitespace-only strings → undefined', () => {
    expect(cleanVars("")).toBeUndefined();
    expect(cleanVars("   ")).toBeUndefined();
    expect(cleanVars("hola")).toBe("hola");
  });

  it("null/undefined → undefined", () => {
    expect(cleanVars(null)).toBeUndefined();
    expect(cleanVars(undefined)).toBeUndefined();
  });

  it("cleans recursively in objects", () => {
    expect(cleanVars({ a: "", b: "x", c: { d: "  ", e: 1 } })).toEqual({ b: "x", c: { e: 1 } });
  });

  it("arrays empty after cleaning → undefined", () => {
    expect(cleanVars(["", "  "])).toBeUndefined();
    expect(cleanVars(["a", ""])).toEqual(["a"]);
  });

  it("fully empty object → undefined", () => {
    expect(cleanVars({ a: "" })).toBeUndefined();
  });
});

describe("cleanVars null (GraphQL mutations)", () => {
  it('"" → null, no undefined', () => {
    expect(cleanVars("", { empty: "null" })).toBeNull();
    expect(cleanVars("  ", { empty: "null" })).toBeNull();
    expect(cleanVars("ok", { empty: "null" })).toBe("ok");
  });

  it("recursive in objects and arrays", () => {
    expect(cleanVars({ a: "", b: "x" }, { empty: "null" })).toEqual({ a: null, b: "x" });
    expect(cleanVars(["", "a"], { empty: "null" })).toEqual([null, "a"]);
  });

  it("null/undefined are preserved", () => {
    expect(cleanVars(null, { empty: "null" })).toBeNull();
    expect(cleanVars(undefined, { empty: "null" })).toBeUndefined();
    expect(cleanVars({ a: undefined, b: null, c: "" }, { empty: "null" })).toEqual({
      a: undefined,
      b: null,
      c: null,
    });
  });

  it("number/boolean pass through untouched", () => {
    expect(cleanVars(0, { empty: "null" })).toBe(0);
    expect(cleanVars(42, { empty: "null" })).toBe(42);
    expect(cleanVars(true, { empty: "null" })).toBe(true);
    expect(cleanVars(false, { empty: "null" })).toBe(false);
  });

  it("nested object with null keeps null", () => {
    expect(cleanVars({ a: { b: null, c: "" }, d: [null, "x"] }, { empty: "null" })).toEqual({
      a: { b: null, c: null },
      d: [null, "x"],
    });
  });
});
