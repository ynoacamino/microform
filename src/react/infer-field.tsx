import type { ReactNode } from "react";
import { inferInputValue } from "../fields/infer.ts";
import type { Microform } from "../registry/microform.ts";
import { resolveRenderer } from "../registry/resolve-renderer.ts";
import type { FieldValue } from "../types/control.ts";
import { useMicroformOptional } from "./context.tsx";

export interface InferFieldInputProps {
  type: string;
  value?: FieldValue;
  inputValue?: string;
  onChange?: (val: FieldValue) => void;
  onBlur?: () => void;
  disabled?: boolean;
  name?: string;
  /** Override por prop; si se omite se usa el contexto. */
  microform?: Microform<string>;
  /** Config extra del campo que se reenvía al renderer como `props`. */
  fieldProps?: Record<string, unknown>;
}

/**
 * Binding delgado: vía única `resolveRenderer`, sin switch por tipo,
 * sin registro top-level, sin UI. Desconocido → `null`.
 */
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
}: InferFieldInputProps): ReactNode {
  const contextual = useMicroformOptional();
  const registry = microform ?? contextual;
  if (!registry) {
    throw new Error("InferFieldInput requiere <MicroformProvider> o prop `microform`.");
  }
  const renderer = resolveRenderer(registry, type);
  if (!renderer) return null;
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
