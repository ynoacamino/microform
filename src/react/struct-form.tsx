import type { ReactNode } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import type { ZodObjectSchema } from "../forms/form-defaults.ts";
import type { FieldStructure } from "../types/field.ts";
import type { FormFieldsProps } from "./form-fields.tsx";
import { FormFields } from "./form-fields.tsx";

export type StructFormSubmitMode = "button" | "auto";

export interface StructFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  structure: FieldStructure<TName>;
  form: UseFormReturn<TFieldValues>;
  renderItem: FormFieldsProps<TFieldValues, TName>["renderItem"];
  schema?: ZodObjectSchema;
  onSubmit: (data: TFieldValues) => void | Promise<void>;
  /** `"button"` pinta submit nativo; `"auto"` lo omite (el adapter dispara). */
  submitMode?: StructFormSubmitMode;
  submitLabel?: string;
  children?: ReactNode;
}

/**
 * Shell delgado: `<form>` nativo + `FormFields`. Sin `useForm` interno
 * (el dueño crea el form), sin chrome UI (botón nativo sin estilos).
 */
export function StructForm<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  structure,
  form,
  renderItem,
  schema,
  onSubmit,
  submitMode = "button",
  submitLabel = "Guardar",
  children,
}: StructFormProps<TFieldValues, TName>): ReactNode {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormFields structure={structure} control={form.control} renderItem={renderItem} schema={schema} />
      {children}
      {submitMode === "button" ? <button type="submit">{submitLabel}</button> : null}
    </form>
  );
}
