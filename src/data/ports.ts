export interface StorageAdapter {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  remove?: (key: string) => void;
}

export interface NotifyAdapter {
  success: (message: string) => void;
  error: (message: string, description?: string) => void;
}

export interface MutationPort {
  mutate: (variables: Record<string, unknown>) => Promise<unknown>;
}

export interface FetchArgs {
  search?: string;
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
}

export interface QueryResult<TItem> {
  items: TItem[];
  total?: number;
}

export interface QuerySource<TItem = unknown> {
  fetch: (args: FetchArgs) => Promise<QueryResult<TItem>>;
}
