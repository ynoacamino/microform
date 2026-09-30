import type { ReactNode } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import type { FieldStructure } from "../core/field";
import type { ZodObjectSchema } from "../schema/zod-defaults";
import type { FormFieldsProps } from "./form-fields";
import { FormFields } from "./form-fields";

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
  submitMode?: StructFormSubmitMode;
  submitLabel?: string;
  disabled?: boolean;
  children?: ReactNode;
}

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
  disabled,
  children,
}: StructFormProps<TFieldValues, TName>): ReactNode {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormFields
        structure={structure}
        control={form.control}
        renderItem={renderItem}
        schema={schema}
        disabled={disabled}
      />
      {children}
      {submitMode === "button" ? <button type="submit">{submitLabel}</button> : null}
    </form>
  );
}
