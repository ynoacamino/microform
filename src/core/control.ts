// Estructural para no depender del lib DOM. File real es asignable.
export interface FileLike {
  readonly name: string;
  readonly size?: number;
  readonly type?: string;
}

export type FieldValue = string | number | string[] | FileLike[] | undefined;

export interface FieldRendererProps<
  Props = Record<string, unknown>,
  // biome-ignore lint/suspicious/noExplicitAny: headless core accepts any value per control
  Value = any,
  Element = unknown,
> {
  props: Props;
  value?: Value;
  inputValue?: string;
  onChange?: (val: Value | undefined) => void;
  onBlur?: () => void;
  disabled?: boolean;
  name?: string;
  ref?: Element;
}

export type FieldRendererFn<
  Props = Record<string, unknown>,
  // biome-ignore lint/suspicious/noExplicitAny: headless core accepts any value per control
  Value = any,
  Element = unknown,
> = (context: FieldRendererProps<Props, Value, Element>) => unknown;

export interface FieldControlDefinition<
  Type extends string = string,
  Props = Record<string, unknown>,
  // biome-ignore lint/suspicious/noExplicitAny: headless core accepts any value per control
  Value = any,
  Element = unknown,
> {
  type: Type;
  renderer: FieldRendererFn<Props, Value, Element>;
}

export function forwardScalarValue<Value>(
  onChange: ((val: Value | undefined) => void) | undefined,
): ((val: string | number | undefined) => void) | undefined {
  if (!onChange) return undefined;
  return (val) => (onChange as (val: string | number | undefined) => void)(val);
}

export function forwardArrayValue<Item>(
  onChange: ((val: Item[] | undefined) => void) | undefined,
): ((val: Item[] | undefined) => void) | undefined {
  if (!onChange) return undefined;
  return (val) => onChange(val);
}

/**
 * @deprecated React-layer legacy. Prefer `QuerySource` (promise-based,
 * framework-agnostic) + `useAsyncQuery` in `microform/react`.
 * Kept for migration from hook-based sources (e.g. urql `useQuery` wrappers).
 * New code should expose `{ fetch: (args) => Promise<{items,total?}> }`.
 */
export type AsyncConfig<T = unknown> = {
  useQuery: (
    search?: string,
    page?: number,
  ) => {
    data: T;
    totalItems?: number;
    isLoading: boolean;
  };
};
