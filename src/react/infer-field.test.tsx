import { describe, expect, it } from "vitest";
import { inferInputValue } from "../core/infer";
import { createMicroform, resolveRenderer } from "../core/registry";

describe("react binding: thin resolution", () => {
  it("resolves per instance, no global registry", () => {
    const renderer = (): string => "x";
    const micro = createMicroform({ controls: [{ type: "text", renderer }] });
    expect(resolveRenderer(micro, "text")).toBe(renderer);
  });

  it("unknown type (e.g. rich-text) → undefined (InferField renders null)", () => {
    const micro = createMicroform<string>({ controls: [] });
    expect(resolveRenderer(micro, "rich-text")).toBeUndefined();
  });

  it("per-instance override without affecting others", () => {
    const first = (): string => "a";
    const second = (): string => "b";
    const a = createMicroform({ controls: [{ type: "text", renderer: first }] });
    const b = createMicroform({ controls: [{ type: "text", renderer: first }] });
    b.register("text", second);
    expect(resolveRenderer(a, "text")).toBe(first);
    expect(resolveRenderer(b, "text")).toBe(second);
  });

  it("inferInputValue: scalar fallback of InferFieldInput", () => {
    expect(inferInputValue("hola")).toBe("hola");
    expect(inferInputValue(42)).toBe("42");
    expect(inferInputValue(undefined)).toBeUndefined();
    expect(inferInputValue(null)).toBeUndefined();
    expect(inferInputValue(["a"])).toBeUndefined();
  });
});
