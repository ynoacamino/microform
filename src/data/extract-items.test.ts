import { describe, expect, it } from "vitest";
import { extractItemsFromData } from "./extract-items";

describe("extractItemsFromData", () => {
  it("returns direct array", () => {
    expect(extractItemsFromData([1, 2])).toEqual([1, 2]);
  });

  it("extracts {x:{items}}", () => {
    expect(extractItemsFromData({ users: { items: [{ id: 1 }] } })).toEqual([{ id: 1 }]);
  });

  it("extracts first nested array", () => {
    expect(extractItemsFromData({ data: ["a"] })).toEqual(["a"]);
  });

  it("returns null when there is no array", () => {
    expect(extractItemsFromData({ a: 1 })).toBeNull();
    expect(extractItemsFromData(null)).toBeNull();
    expect(extractItemsFromData("x")).toBeNull();
  });
});
