import { describe, expect, it } from "vitest";
import { cleanVariables } from "./clean-variables.ts";

describe("cleanVariables", () => {
  it('"" y strings solo-espacios → undefined', () => {
    expect(cleanVariables("")).toBeUndefined();
    expect(cleanVariables("   ")).toBeUndefined();
    expect(cleanVariables("hola")).toBe("hola");
  });

  it("null/undefined → undefined", () => {
    expect(cleanVariables(null)).toBeUndefined();
    expect(cleanVariables(undefined)).toBeUndefined();
  });

  it("limpia recursivo en objetos", () => {
    expect(cleanVariables({ a: "", b: "x", c: { d: "  ", e: 1 } })).toEqual({ b: "x", c: { e: 1 } });
  });

  it("arrays vacíos tras limpiar → undefined", () => {
    expect(cleanVariables(["", "  "])).toBeUndefined();
    expect(cleanVariables(["a", ""])).toEqual(["a"]);
  });

  it("objeto totalmente vacío → undefined", () => {
    expect(cleanVariables({ a: "" })).toBeUndefined();
  });
});
