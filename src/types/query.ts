export type ExtractQueryVariables<T> = T extends (args: { variables: infer V }) => unknown ? V : never;

export type ExtractQueryData<T> = T extends (
  // biome-ignore lint/suspicious/noExplicitAny: Matches URQL tuple or standard hook result
  ...args: any[]
) => [{ data?: infer D }, unknown] | { data?: infer D }
  ? D
  : never;

export type ExtractQueryItem<T> =
  ExtractQueryData<T> extends {
    items?: (infer I)[];
  }
    ? I
    : ExtractQueryData<T> extends Record<string, { items?: unknown[] } | unknown>
      ? ExtractQueryData<T>[keyof ExtractQueryData<T>] extends {
          items?: (infer I2)[];
        }
        ? I2
        : ExtractQueryData<T> extends (infer I3)[]
          ? I3
          : // biome-ignore lint/suspicious/noExplicitAny: Dynamic fallback for complex query structures
            any
      : ExtractQueryData<T> extends (infer I3)[]
        ? I3
        : // biome-ignore lint/suspicious/noExplicitAny: Dynamic fallback for complex query structures
          any;
