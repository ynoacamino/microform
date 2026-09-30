import type { ReactNode } from "react";
import { useMemo } from "react";
import type { Control, ControllerFieldState, ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { FieldStructure, FieldType } from "../core/field";
import type { ZodObjectSchema } from "../schema/zod-defaults";
import { buildRequiredMap } from "../schema/zod-defaults";
import { FieldGrid } from "./field-grid";

export interface FormFieldsItemArgs<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  rhf: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  required: boolean;
  invalid: boolean;
}

export interface FormFieldsProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  structure: FieldStructure<TName>;
  control: Control<TFieldValues>;
  renderItem: (field: FieldType<TName>, args: FormFieldsItemArgs<TFieldValues, TName>) => ReactNode;
  schema?: ZodObjectSchema;
  disabled?: boolean;
}

export function FormFields<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ structure, control, renderItem, schema, disabled }: FormFieldsProps<TFieldValues, TName>): ReactNode {
  const requiredMap = useMemo(() => (schema ? buildRequiredMap(schema) : undefined), [schema]);
  return (
    <FieldGrid
      structure={structure}
      renderField={(item) => (
        <Controller
          control={control}
          name={item.name}
          disabled={disabled}
          render={({ field, fieldState }) => (
            <>
              {renderItem(item, {
                rhf: field,
                fieldState,
                required: requiredMap?.get(item.name) ?? false,
                invalid: fieldState.invalid,
              })}
            </>
          )}
        />
      )}
    />
  );
}
