import type { ReactNode } from "react";
import { inferInputValue } from "../core/infer";
import type { Microform } from "../core/registry";
import { resolveRenderer } from "../core/registry";
import { useMicroformOptional } from "./provider";

export interface InferFieldInputProps<
  // biome-ignore lint/suspicious/noExplicitAny: value type depends on the injected control
  Value = any,
> {
  type: string;
  value?: Value;
  inputValue?: string;
  onChange?: (val: Value | undefined) => void;
  onBlur?: () => void;
  disabled?: boolean;
  name?: string;
  microform?: Microform<string>;
  fieldProps?: Record<string, unknown>;
  onUnknownType?: (type: string) => ReactNode;
}

export function InferFieldInput<
  // biome-ignore lint/suspicious/noExplicitAny: value type depends on the injected control
  Value = any,
>({
  type,
  value,
  inputValue,
  onChange,
  onBlur,
  disabled,
  name,
  microform,
  fieldProps,
  onUnknownType,
}: InferFieldInputProps<Value>): ReactNode {
  const contextual = useMicroformOptional();
  const registry = microform ?? contextual;
  if (!registry) {
    throw new Error("InferFieldInput requiere <MicroformProvider> o prop `microform`.");
  }
  const renderer = resolveRenderer(registry, type);
  if (!renderer) return onUnknownType?.(type) ?? null;
  return renderer({
    props: { type, ...fieldProps },
    value,
    inputValue: inputValue ?? inferInputValue(value),
    onChange,
    onBlur,
    disabled,
    name,
  }) as ReactNode;
}
