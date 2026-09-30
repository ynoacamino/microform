import { useEffect, useRef, useState } from "react";
import type { QueryResult, QuerySource } from "../data/ports";

export interface UseAsyncQueryArgs<TItem> {
  source: QuerySource<TItem>;
  search?: string;
  page?: number;
  pageSize?: number;
  debounceMs?: number;
  enabled?: boolean;
}

export interface UseAsyncQueryResult<TItem> {
  data: TItem[];
  total?: number;
  isLoading: boolean;
  error?: unknown;
  refetch: () => void;
}

export function useAsyncQuery<TItem>({
  source,
  search = "",
  page = 1,
  pageSize = 50,
  debounceMs = 250,
  enabled = true,
}: UseAsyncQueryArgs<TItem>): UseAsyncQueryResult<TItem> {
  const [data, setData] = useState<TItem[]>([]);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(undefined);
  const [nonce, setNonce] = useState(0);
  const gen = useRef(0);

  useEffect(() => {
    void nonce; // trigger intencional de refetch
    if (!enabled) return;
    const myGen = ++gen.current;
    setIsLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      source
        .fetch({ search, page, pageSize, signal: controller.signal })
        .then((res: QueryResult<TItem>) => {
          if (gen.current !== myGen) return;
          setData(res.items);
          setTotal(res.total);
          setError(undefined);
        })
        .catch((err: unknown) => {
          if (gen.current !== myGen) return;
          if (err instanceof DOMException && err.name === "AbortError") return;
          setError(err);
        })
        .finally(() => {
          if (gen.current !== myGen) return;
          setIsLoading(false);
        });
    }, debounceMs);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [source, search, page, pageSize, debounceMs, enabled, nonce]);

  return { data, total, isLoading, error, refetch: () => setNonce((n) => n + 1) };
}
