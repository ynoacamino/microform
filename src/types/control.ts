// Canal de valores framework-agnóstico. Sin React.
// El adapter React estrecha `unknown` a `ReactNode`.

/** Valor que transporta onChange. Incluye multivalor y archivos. */
export type FieldValue = string | number | string[] | File[] | undefined;

export interface FieldRendererProps<Props = Record<string, unknown>, Element = unknown> {
  props: Props;
  value?: FieldValue;
  /** Representación string solo para controles escalares. */
  inputValue?: string;
  onChange?: (val: FieldValue) => void;
  onBlur?: () => void;
  disabled?: boolean;
  name?: string;
  ref?: Element;
}

/** Renderer genérico. El core lo trata como caja negra `unknown`. */
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

/**
 * Adapta onChange del framework a un UI escalar que solo emite
 * `string | number | undefined`. Reenvío directo, sin validación runtime.
 */
export function forwardScalarValue(
  onChange: ((val: FieldValue) => void) | undefined,
): ((val: string | number | undefined) => void) | undefined {
  if (!onChange) return undefined;
  return (val) => onChange(val);
}

/** Contrato async style-agnóstico: el usuario provee `useQuery`. */
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
