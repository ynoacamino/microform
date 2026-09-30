import { describe, expect, it } from "vitest";
import { createEnumOptions, getOptionLabel } from "./enum-options";

describe("createEnumOptions", () => {
  it("converts Record to options with lowercased key", () => {
    const LABELS = { DNI: "DNI", CE: "Carné de extranjería" } as const;
    type Doc = keyof typeof LABELS;
    const opts = createEnumOptions<Doc>(LABELS);
    expect(opts).toEqual([
      { key: "dni", value: "DNI", label: "DNI" },
      { key: "ce", value: "CE", label: "Carné de extranjería" },
    ]);
  });

  it("returns empty array for empty labels", () => {
    expect(createEnumOptions<"x">({} as Record<"x", string>)).toEqual([]);
  });

  it("uses value as label when the record has no label", () => {
    const labels = { A: undefined } as unknown as Record<"A", string>;
    const opts = createEnumOptions<"A">(labels);
    expect(opts).toEqual([{ key: "a", value: "A", label: "A" }]);
  });

  it("requires explicit generic at compile time", () => {
    const LABELS = { DNI: "DNI" } as const;
    // @ts-expect-error — sin genérico el parámetro es un mensaje de error
    createEnumOptions(LABELS);
  });

  it("resolves label with fallback to value", () => {
    const labels = { A: "Alfa", B: undefined } as unknown as Record<"A" | "B", string>;
    const opts = createEnumOptions<"A" | "B">(labels);
    expect(opts).toEqual([
      { key: "a", value: "A", label: "Alfa" },
      { key: "b", value: "B", label: "B" },
    ]);
  });

  it("returns [] for empty object without casts", () => {
    type Empty = "x";
    const labels: Record<Empty, string> = {} as Record<Empty, string>;
    expect(createEnumOptions<Empty>(labels)).toEqual([]);
  });
});

describe("getOptionLabel", () => {
  it("returns the record label", () => {
    expect(getOptionLabel({ DNI: "Documento" }, "DNI")).toBe("Documento");
  });

  it("returns the value when there is no label", () => {
    expect(getOptionLabel({}, "CE")).toBe("CE");
  });
});
