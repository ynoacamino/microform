import { describe, expect, it } from "vitest";
import { extractItemsFromData } from "./extract-items.ts";

describe("extractItemsFromData", () => {
  it("retorna arreglo directo", () => {
    expect(extractItemsFromData([1, 2])).toEqual([1, 2]);
  });

  it("extrae {x:{items}}", () => {
    expect(extractItemsFromData({ users: { items: [{ id: 1 }] } })).toEqual([{ id: 1 }]);
  });

  it("extrae primer arreglo anidado", () => {
    expect(extractItemsFromData({ data: ["a"] })).toEqual(["a"]);
  });

  it("retorna null si no hay arreglo", () => {
    expect(extractItemsFromData({ a: 1 })).toBeNull();
    expect(extractItemsFromData(null)).toBeNull();
    expect(extractItemsFromData("x")).toBeNull();
  });
});
