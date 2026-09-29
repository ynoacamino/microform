import { describe, expect, it } from "vitest";
import { createEnumOptions } from "./create-enum-options.ts";

describe("createEnumOptions", () => {
  it("convierte Record a opciones con key lowercased", () => {
    const LABELS = { DNI: "DNI", CE: "Carné de extranjería" } as const;
    type Doc = keyof typeof LABELS;
    const opts = createEnumOptions<Doc>(LABELS);
    expect(opts).toEqual([
      { key: "dni", value: "DNI", label: "DNI" },
      { key: "ce", value: "CE", label: "Carné de extranjería" },
    ]);
  });

  it("retorna arreglo vacío con labels vacíos", () => {
    expect(createEnumOptions<"x">({} as Record<"x", string>)).toEqual([]);
  });

  it("usa value como label cuando el registro no tiene etiqueta", () => {
    const labels = { A: undefined } as unknown as Record<"A", string>;
    const opts = createEnumOptions<"A">(labels);
    expect(opts).toEqual([{ key: "a", value: "A", label: "A" }]);
  });

  it("exige genérico explícito en tiempo de compilación", () => {
    const LABELS = { DNI: "DNI" } as const;
    // @ts-expect-error — sin genérico el parámetro es un mensaje de error
    createEnumOptions(LABELS);
  });

  it("resuelve label con fallback a value", () => {
    const labels = { A: "Alfa", B: undefined } as unknown as Record<"A" | "B", string>;
    const opts = createEnumOptions<"A" | "B">(labels);
    expect(opts).toEqual([
      { key: "a", value: "A", label: "Alfa" },
      { key: "b", value: "B", label: "B" },
    ]);
  });

  it("retorna [] con objeto vacío sin casts", () => {
    type Empty = "x";
    const labels: Record<Empty, string> = {} as Record<Empty, string>;
    expect(createEnumOptions<Empty>(labels)).toEqual([]);
  });
});
