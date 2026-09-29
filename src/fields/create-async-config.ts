import type { AsyncConfig } from "../types/control.ts";
import type { ExtractQueryData, ExtractQueryItem, ExtractQueryVariables } from "../types/query.ts";
import { cleanVariables } from "../utils/clean-variables.ts";
import { extractItemsFromData } from "../utils/extract-items.ts";

// Overload 1: mapItem callback (item -> TItem)
export function createAsyncConfig<
  // biome-ignore lint/suspicious/noExplicitAny: Required for function parameter contravariance in generic query hooks
  THook extends (...args: any[]) => any,
  TItem,
>(options: {
  useQuery: THook;
  getVariables?: (search: string, page: number) => ExtractQueryVariables<THook>;
  getDefaultVariables?: (search: string, page: number) => ExtractQueryVariables<THook>;
  getTotalCount?: (rawData: NonNullable<ExtractQueryData<THook>>) => number | undefined;
  pageSize?: number;
  mapItem: (item: ExtractQueryItem<THook>) => TItem;
}): AsyncConfig<TItem[]>;

// Overload 2: transform callback (data -> TOutput)
export function createAsyncConfig<
  // biome-ignore lint/suspicious/noExplicitAny: Required for function parameter contravariance in generic query hooks
  THook extends (...args: any[]) => any,
  TOutput,
>(options: {
  useQuery: THook;
  getVariables?: (search: string, page: number) => ExtractQueryVariables<THook>;
  getDefaultVariables?: (search: string, page: number) => ExtractQueryVariables<THook>;
  getTotalCount?: (rawData: NonNullable<ExtractQueryData<THook>>) => number | undefined;
  pageSize?: number;
  transform: (data: NonNullable<ExtractQueryData<THook>>) => TOutput;
}): AsyncConfig<TOutput>;

// Implementation
// biome-ignore lint/suspicious/noExplicitAny: Implementation signature overload handling
export function createAsyncConfig(options: any): AsyncConfig<any> {
  const pageSize = options.pageSize ?? 50;
  return {
    useQuery: (search = "", page = 1) => {
      const builtDefault = options.getDefaultVariables
        ? options.getDefaultVariables(search, page)
        : {
            take: pageSize,
            skip: (page - 1) * pageSize,
            ...(search ? { filter: { search: { contains: search } } } : {}),
          };

      const rawVariables = options.getVariables ? options.getVariables(search, page) : builtDefault;

      const variables = cleanVariables(rawVariables);

      const hookResult = options.useQuery({ variables });

      const result = Array.isArray(hookResult) ? hookResult[0] : hookResult;
      const rawData = result?.data;
      const isLoading = Boolean(result?.fetching ?? result?.isLoading ?? false);
      const totalItems = rawData
        ? ((options.getTotalCount ? options.getTotalCount(rawData) : rawData.totalCount) ?? undefined)
        : undefined;

      let data: unknown;
      if (options.mapItem) {
        const items = rawData ? extractItemsFromData(rawData) : null;
        data = items ? items.map((item) => options.mapItem(item)) : [];
      } else {
        data = rawData ? options.transform(rawData) : [];
      }

      return {
        data,
        isLoading,
        totalItems,
      };
    },
  };
}
