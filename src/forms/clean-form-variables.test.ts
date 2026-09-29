import { describe, expect, it } from "vitest";
import { cleanFormVariables } from "./clean-form-variables.ts";

describe("cleanFormVariables", () => {
  it('"" → null (GraphQL), no undefined', () => {
    expect(cleanFormVariables("")).toBeNull();
    expect(cleanFormVariables("  ")).toBeNull();
    expect(cleanFormVariables("ok")).toBe("ok");
  });

  it("recursivo en objetos y arreglos", () => {
    expect(cleanFormVariables({ a: "", b: "x" })).toEqual({
      a: null,
      b: "x",
    });
    expect(cleanFormVariables(["", "a"])).toEqual([null, "a"]);
  });
});

describe("cleanFormVariables casos borde", () => {
  it("null/undefined se preservan (undefined = omitido, null = explícito)", () => {
    expect(cleanFormVariables(null)).toBeNull();
    expect(cleanFormVariables(undefined)).toBeUndefined();
    expect(cleanFormVariables({ a: undefined, b: null, c: "" })).toEqual({ a: undefined, b: null, c: null });
  });

  it("number/boolean pasan intactos", () => {
    expect(cleanFormVariables(0)).toBe(0);
    expect(cleanFormVariables(42)).toBe(42);
    expect(cleanFormVariables(true)).toBe(true);
    expect(cleanFormVariables(false)).toBe(false);
  });

  it("objeto anidado con null conserva null", () => {
    expect(cleanFormVariables({ a: { b: null, c: "" }, d: [null, "x"] })).toEqual({
      a: { b: null, c: null },
      d: [null, "x"],
    });
  });
});
