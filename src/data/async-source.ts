import { extractItemsFromData } from "./extract-items";
import type { FetchArgs, QueryResult, QuerySource } from "./ports";

export interface AsyncSourceResult<T> {
  data: T;
  totalItems?: number;
}

export interface PromiseAsyncSource<T> {
  fetch: (search?: string, page?: number) => Promise<AsyncSourceResult<T>>;
}

type RawFetch = (args: FetchArgs) => Promise<unknown>;

export function createAsyncSource<TItem>(options: {
  fetch: RawFetch;
  pageSize?: number;
  mapItem: (item: unknown) => TItem;
  getTotal?: (rawData: NonNullable<unknown>) => number | undefined;
}): PromiseAsyncSource<TItem[]>;
export function createAsyncSource<TOutput>(options: {
  fetch: RawFetch;
  pageSize?: number;
  transform: (rawData: NonNullable<unknown>) => TOutput;
  getTotal?: (rawData: NonNullable<unknown>) => number | undefined;
}): PromiseAsyncSource<TOutput>;
export function createAsyncSource(options: {
  fetch: RawFetch;
  pageSize?: number;
  mapItem?: (item: unknown) => unknown;
  transform?: (rawData: NonNullable<unknown>) => unknown;
  getTotal?: (rawData: NonNullable<unknown>) => number | undefined;
}): PromiseAsyncSource<unknown> {
  const pageSize = options.pageSize ?? 50;
  return {
    fetch: async (search = "", page = 1) => {
      const rawData = await options.fetch({ search, page, pageSize });
      const result = rawData as QueryResult<unknown> & { totalCount?: unknown; totalItems?: unknown };
      let data: unknown;
      if (options.mapItem) {
        const items = rawData ? extractItemsFromData(rawData) : null;
        data = items ? items.map((item) => (options.mapItem as (item: unknown) => unknown)(item)) : [];
      } else if (options.transform) {
        data = rawData ? options.transform(rawData as NonNullable<unknown>) : [];
      } else {
        data = [];
      }
      let totalItems: number | undefined;
      if (rawData !== null && rawData !== undefined) {
        if (options.getTotal) {
          totalItems = options.getTotal(rawData as NonNullable<unknown>);
        } else if (typeof result === "object" && result !== null) {
          if (typeof result.total === "number") totalItems = result.total;
          else if (typeof result.totalItems === "number") totalItems = result.totalItems;
          else if (typeof result.totalCount === "number") totalItems = result.totalCount;
        }
      }
      return { data, totalItems };
    },
  };
}

/**
 * Adapts a `PromiseAsyncSource<T[]>` (e.g. built with `createAsyncSource`
 * + `mapItem`) to the canonical list-shaped `QuerySource<T>`.
 * `pageSize`/`signal` from `FetchArgs` are forwarded to `fetch` when the
 * underlying source accepts them; `createAsyncSource` fixes `pageSize` at
 * creation time, so per-call `pageSize` is informational there.
 */
export function asQuerySource<T>(source: PromiseAsyncSource<T[]>): QuerySource<T> {
  return {
    fetch: async (args: FetchArgs): Promise<QueryResult<T>> => {
      const res = await source.fetch(args.search ?? "", args.page ?? 1);
      return { items: res.data, total: res.totalItems };
    },
  };
}
