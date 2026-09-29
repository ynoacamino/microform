import { describe, expect, it, vi } from "vitest";
import type { FieldRendererFn } from "../types/control.ts";
import { createRegistry } from "./create-registry.ts";

describe("createRegistry", () => {
  it("registra y recupera renderers", () => {
    const registry = createRegistry<"text" | "color">();
    const renderText = vi.fn(() => "text-ui");
    registry.register("text", renderText);
    expect(registry.get("text")).toBe(renderText);
    expect(registry.has("text")).toBe(true);
    expect(registry.has("color")).toBe(false);
  });

  it("soporta customFields sin colisión entre instancias", () => {
    const a = createRegistry<string>();
    const b = createRegistry<string>();
    a.register("rating", () => "a");
    expect(b.get("rating")).toBeUndefined();
    expect(a.types()).toEqual(["rating"]);
  });

  it("registerAll ignora undefined", () => {
    const registry = createRegistry<"text" | "email">();
    const renderText = () => "t";
    registry.registerAll({ text: renderText, email: undefined });
    expect(registry.get("text")).toBe(renderText);
    expect(registry.get("email")).toBeUndefined();
  });

  it("sobreescribir permite al usuario customizar built-in", () => {
    const registry = createRegistry<string>({ text: () => "default" });
    registry.register("text", () => "custom");
    expect(registry.get("text")?.({ props: {} })).toBe("custom");
  });

  it("initial ignora entradas undefined", () => {
    const registry = createRegistry<"text" | "email">({
      text: undefined as unknown as FieldRendererFn,
    });
    expect(registry.get("text")).toBeUndefined();
    expect(registry.has("text")).toBe(false);
    expect(registry.types()).toEqual([]);
  });
});
