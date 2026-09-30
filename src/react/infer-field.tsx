import type { ReactNode } from "react";
import type { FieldValue } from "@/core/control.ts";
import { inferInputValue } from "@/core/infer.ts";
import type { Microform } from "@/core/registry.ts";
import { resolveRenderer } from "@/core/registry.ts";
import { useMicroformOptional } from "@/react/provider.tsx";

export interface InferFieldInputProps {
  type: string;
  value?: FieldValue;
  inputValue?: string;
  onChange?: (val: FieldValue) => void;
  onBlur?: () => void;
  disabled?: boolean;
  name?: string;
  microform?: Microform<string>;
  fieldProps?: Record<string, unknown>;
  onUnknownType?: (type: string) => ReactNode;
}

export function InferFieldInput({
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
}: InferFieldInputProps): ReactNode {
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
