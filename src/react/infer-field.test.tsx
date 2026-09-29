import { describe, expect, it } from "vitest";
import { inferInputValue } from "../fields/infer.ts";
import { createMicroform } from "../registry/microform.ts";
import { resolveRenderer } from "../registry/resolve-renderer.ts";

/**
 * Contrato del binding React sin DOM (entorno node): vía única de
 * resolución + fallback escalar. Los componentes (`InferFieldInput`,
 * `FieldGrid`, `StructForm`/`FormFields`) delegan en estas primitivas.
 */
describe("react binding: resolución delgada", () => {
  it("resuelve por instancia, sin registro global", () => {
    const renderer = (): string => "x";
    const micro = createMicroform({ controls: [{ type: "text", renderer }] });
    expect(resolveRenderer(micro, "text")).toBe(renderer);
  });

  it("tipo desconocido (p. ej. rich-text en PWA) → undefined (InferField pinta null)", () => {
    const micro = createMicroform<string>({ controls: [] });
    expect(resolveRenderer(micro, "rich-text")).toBeUndefined();
  });

  it("override por instancia sin afectar a otras", () => {
    const first = (): string => "a";
    const second = (): string => "b";
    const a = createMicroform({ controls: [{ type: "text", renderer: first }] });
    const b = createMicroform({ controls: [{ type: "text", renderer: first }] });
    b.register("text", second);
    expect(resolveRenderer(a, "text")).toBe(first);
    expect(resolveRenderer(b, "text")).toBe(second);
  });

  it("inferInputValue: fallback escalar de InferFieldInput", () => {
    expect(inferInputValue("hola")).toBe("hola");
    expect(inferInputValue(42)).toBe("42");
    expect(inferInputValue(undefined)).toBeUndefined();
    expect(inferInputValue(null)).toBeUndefined();
    expect(inferInputValue(["a"])).toBeUndefined();
  });
});
