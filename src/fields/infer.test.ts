import { describe, expect, it } from "vitest";
import { inferInputValue } from "./infer.ts";

describe("inferInputValue", () => {
  it("maps scalars and empties arrays/nullish", () => {
    expect(inferInputValue("hello")).toBe("hello");
    expect(inferInputValue("")).toBe("");
    expect(inferInputValue(42)).toBe("42");
    expect(inferInputValue(["a", "b"])).toBeUndefined();
    expect(inferInputValue(null)).toBeUndefined();
    expect(inferInputValue(undefined)).toBeUndefined();
  });
});
