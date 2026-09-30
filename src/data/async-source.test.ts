import { describe, expect, it } from "vitest";
import { createAsyncSource } from "./async-source";

describe("createAsyncSource", () => {
  it("mapItem extracts items and total", async () => {
    const source = createAsyncSource({
      fetch: async () => ({ users: { items: [{ id: "1" }] }, total: 7 }),
      mapItem: (item) => (item as { id: string }).id,
    });
    const out = await source.fetch("an", 2);
    expect(out.data).toEqual(["1"]);
    expect(out.totalItems).toBe(7);
  });

  it("transform branch + getTotal override", async () => {
    const source = createAsyncSource({
      fetch: async () => ({ rows: [1, 2], count: 99 }),
      transform: (raw) => (raw as { rows: number[] }).rows.length,
      getTotal: (raw) => (raw as { count: number }).count,
    });
    const out = await source.fetch("x", 1);
    expect(out.data).toBe(2);
    expect(out.totalItems).toBe(99);
  });

  it("fetch receives search/page/pageSize", async () => {
    const seen: unknown[] = [];
    const source = createAsyncSource({
      fetch: async (args) => {
        seen.push(args);
        return { items: [] as unknown[], total: 0 };
      },
      pageSize: 20,
      mapItem: (item) => item,
    });
    await source.fetch("q", 2);
    expect(seen[0]).toEqual({ search: "q", page: 2, pageSize: 20 });
  });

  it("missing data → [] and undefined totalItems", async () => {
    const source = createAsyncSource({
      fetch: async () => null,
      mapItem: (item) => item,
    });
    const out = await source.fetch("a", 1);
    expect(out.data).toEqual([]);
    expect(out.totalItems).toBeUndefined();
  });

  it("legacy totalCount/totalItems are detected", async () => {
    const a = createAsyncSource({
      fetch: async () => ({ items: [1], totalCount: 5 }),
      mapItem: (item) => item,
    });
    expect((await a.fetch("", 1)).totalItems).toBe(5);
    const b = createAsyncSource({
      fetch: async () => ({ items: [1], totalItems: 6 }),
      mapItem: (item) => item,
    });
    expect((await b.fetch("", 1)).totalItems).toBe(6);
  });
});
