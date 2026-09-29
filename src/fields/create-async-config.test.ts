import { describe, expect, it, vi } from "vitest";
import { createAsyncConfig } from "./create-async-config.ts";

type Item = { id: string; name: string };

type UsersData = { users: { items: Item[] }; totalCount: number };
type ItemsData = { items: Item[]; totalCount: number };
type Variables = {
  take: number;
  skip: number;
  filter?: { search: { contains: string } };
};

describe("createAsyncConfig", () => {
  it("mapItem con tupla urql: take/skip/filter y totalItems", () => {
    const captured: { variables?: Variables } = {};
    const useQuery = (args: { variables: Variables }): [{ data: UsersData }, { fetching: boolean }] => {
      captured.variables = args.variables;
      return [{ data: { users: { items: [{ id: "1", name: "Ana" }] }, totalCount: 7 } }, { fetching: false }];
    };
    const config = createAsyncConfig({
      useQuery,
      mapItem: (item) => ({ key: item.id, value: item.id, label: item.name }),
    });
    const out = config.useQuery("an", 2);
    expect(captured.variables).toEqual({ take: 50, skip: 50, filter: { search: { contains: "an" } } });
    expect(out.data).toEqual([{ key: "1", value: "1", label: "Ana" }]);
    expect(out.totalItems).toBe(7);
    expect(out.isLoading).toBe(false);
  });

  it("objeto hook con isLoading y search vacío sin filter", () => {
    const captured: { variables?: Variables } = {};
    const useQuery = (args: { variables: Variables }): { data: ItemsData; isLoading: boolean } => {
      captured.variables = args.variables;
      return { data: { items: [{ id: "2", name: "Beto" }], totalCount: 1 }, isLoading: true };
    };
    const config = createAsyncConfig({
      useQuery,
      mapItem: (item) => item.id,
    });
    const out = config.useQuery("", 1);
    expect(captured.variables).toEqual({ take: 50, skip: 0 });
    expect(out.isLoading).toBe(true);
    expect(out.data).toEqual(["2"]);
  });

  it("transform branch y getTotalCount override", () => {
    type RowsData = { rows: number[]; count: number };
    const useQuery = (): { data: RowsData; fetching: boolean } => ({
      data: { rows: [1, 2], count: 99 },
      fetching: false,
    });
    const config = createAsyncConfig({
      useQuery,
      transform: (data) => data.rows.length,
      getTotalCount: (raw) => raw.count,
    });
    const out = config.useQuery("x", 1);
    expect(out.data).toBe(2);
    expect(out.totalItems).toBe(99);
  });

  it("getVariables override y variables limpias", () => {
    type SearchVars = { take: number; skip: number; q?: string; empty?: string };
    const seen: SearchVars[] = [];
    const useQuery = (args: { variables: SearchVars }): { data: ItemsData; fetching: boolean } => {
      seen.push(args.variables);
      return { data: { items: [], totalCount: 0 }, fetching: false };
    };
    const getVariables = vi.fn(
      (search: string, page: number): SearchVars => ({
        take: 10,
        skip: (page - 1) * 10,
        q: search,
        empty: "",
      }),
    );
    const config = createAsyncConfig({ useQuery, getVariables, mapItem: (item) => item });
    config.useQuery("abc", 3);
    expect(getVariables).toHaveBeenCalledWith("abc", 3);
    expect(seen[0]).toEqual({ take: 10, skip: 20, q: "abc" });
  });

  it("data ausente → [] y totalItems undefined", () => {
    const configMap = createAsyncConfig({
      useQuery: (): { data: ItemsData | undefined; fetching: boolean } => ({
        data: undefined,
        fetching: false,
      }),
      mapItem: (item) => item,
    });
    expect(configMap.useQuery("a", 1).data).toEqual([]);
    expect(configMap.useQuery("a", 1).totalItems).toBeUndefined();
    const configTr = createAsyncConfig({
      useQuery: (): [{ data: { v: number } | undefined }, { fetching: boolean }] => [
        { data: undefined },
        { fetching: false },
      ],
      transform: (d) => d.v,
    });
    expect(configTr.useQuery("a", 1).data).toEqual([]);
  });

  it("pageSize y getDefaultVariables custom", () => {
    const captured: { variables?: Variables } = {};
    const config = createAsyncConfig({
      useQuery: (args: { variables: Variables }): { data: ItemsData | null; fetching: boolean } => {
        captured.variables = args.variables;
        return { data: null, fetching: false };
      },
      pageSize: 20,
      mapItem: (item) => item,
    });
    config.useQuery("q", 2);
    expect(captured.variables).toEqual({ take: 20, skip: 20, filter: { search: { contains: "q" } } });

    type CustomVars = { take: number; skip: number; q: string };
    const captured2: { variables?: CustomVars } = {};
    const config2 = createAsyncConfig({
      useQuery: (args: { variables: CustomVars }): { data: ItemsData | null; fetching: boolean } => {
        captured2.variables = args.variables;
        return { data: null, fetching: false };
      },
      getDefaultVariables: (s: string, p: number): CustomVars => ({ take: 5, skip: p, q: s }),
      mapItem: (item) => item,
    });
    config2.useQuery("z", 4);
    expect(captured2.variables).toEqual({ take: 5, skip: 4, q: "z" });
  });
});
