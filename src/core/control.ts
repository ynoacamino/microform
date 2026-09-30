// Estructural para no depender del lib DOM. File real es asignable.
export interface FileLike {
  readonly name: string;
  readonly size?: number;
  readonly type?: string;
}

export type FieldValue = string | number | string[] | FileLike[] | undefined;

export interface FieldRendererProps<Props = Record<string, unknown>, Element = unknown> {
  props: Props;
  value?: FieldValue;
  inputValue?: string;
  onChange?: (val: FieldValue) => void;
  onBlur?: () => void;
  disabled?: boolean;
  name?: string;
  ref?: Element;
}

export type FieldRendererFn<Props = Record<string, unknown>, Element = unknown> = (
  context: FieldRendererProps<Props, Element>,
) => unknown;

export interface FieldControlDefinition<
  Type extends string = string,
  Props = Record<string, unknown>,
  Element = unknown,
> {
  type: Type;
  renderer: FieldRendererFn<Props, Element>;
}

export function forwardScalarValue(
  onChange: ((val: FieldValue) => void) | undefined,
): ((val: string | number | undefined) => void) | undefined {
  if (!onChange) return undefined;
  return (val) => onChange(val);
}

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
