import { describe, expect, it } from "vitest";
import type { FieldStructure } from "./field";
import { flattenStructure, MAX_COLUMNS, validateColumns, validateStructure } from "./structure";

describe("validateColumns", () => {
  it("accepts boundaries 1 and 12", () => {
    expect(validateColumns(1)).toBe(true);
    expect(validateColumns(12)).toBe(true);
    expect(MAX_COLUMNS).toBe(12);
  });

  it("rejects out-of-range 0 and 13", () => {
    expect(validateColumns(0)).toBe(false);
    expect(validateColumns(13)).toBe(false);
  });
});

describe("flattenStructure", () => {
  it("expands mixed rows and fields in order", () => {
    const structure: FieldStructure<string> = [
      { name: "a", label: "A", type: "text" },
      {
        columns: 2,
        fields: [
          { name: "b", label: "B", type: "text" },
          { name: "c", label: "C", type: "number" },
        ],
      },
      { name: "d", label: "D", type: "text" },
    ];
    const flat = flattenStructure(structure);
    expect(flat.map((f) => f.name)).toEqual(["a", "b", "c", "d"]);
  });

  it("recurse into sections", () => {
    const structure: FieldStructure<string> = [
      {
        kind: "section",
        title: "S",
        children: [
          { name: "a", label: "A", type: "text" },
          { columns: 2, fields: [{ name: "b", label: "B", type: "text" }] },
        ],
      },
    ];
    expect(flattenStructure(structure).map((f) => f.name)).toEqual(["a", "b"]);
  });
});

describe("validateStructure", () => {
  it("accepts valid structures", () => {
    const structure: FieldStructure<string> = [
      { name: "a", label: "A", type: "text" },
      { columns: 2, fields: [{ name: "b", label: "B", type: "text", colspan: 2 }] },
      { kind: "section", title: "S", children: [{ name: "c", label: "C", type: "text" }] },
    ];
    expect(validateStructure(structure)).toEqual([]);
  });

  it("rejects bad columns/colspan/empty", () => {
    const structure: FieldStructure<string> = [
      { columns: 0, fields: [{ name: "a", label: "A", type: "text", colspan: 13 }] },
      { kind: "section", title: "Empty", children: [] },
    ];
    const errors = validateStructure(structure);
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });
});
