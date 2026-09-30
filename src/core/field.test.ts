import { describe, expect, it } from "vitest";
import { isFieldRow } from "./field";

describe("isFieldRow", () => {
  it("distinguishes field vs row", () => {
    expect(isFieldRow({ name: "a", label: "A", type: "text" })).toBe(false);
    expect(
      isFieldRow({
        columns: 2,
        fields: [{ name: "a", label: "A", type: "text" }],
      }),
    ).toBe(true);
  });
});
