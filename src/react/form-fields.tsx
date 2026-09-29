import type { ReactNode } from "react";
import { useMemo } from "react";
import type { Control, ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { ZodObjectSchema } from "../forms/form-defaults.ts";
import { buildRequiredMap } from "../forms/form-defaults.ts";
import type { FieldStructure, FieldType } from "../types/field.ts";
import { FieldGrid } from "./field-grid.tsx";

export interface FormFieldsItemArgs<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  rhf: ControllerRenderProps<TFieldValues, TName>;
  required: boolean;
}

export interface FormFieldsProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  structure: FieldStructure<TName>;
  control: Control<TFieldValues>;
  renderItem: (field: FieldType<TName>, args: FormFieldsItemArgs<TFieldValues, TName>) => ReactNode;
  schema?: ZodObjectSchema;
}

/**
 * Itera la estructura con un `Controller` por campo y deriva `required`
 * del schema. El chrome visual (`InferItem`, labels, errores) lo provee
 * el adapter vía `renderItem`.
 */
export function FormFields<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ structure, control, renderItem, schema }: FormFieldsProps<TFieldValues, TName>): ReactNode {
  const requiredMap = useMemo(() => (schema ? buildRequiredMap(schema) : undefined), [schema]);
  return (
    <FieldGrid
      structure={structure}
      renderField={(item) => (
        <Controller
          control={control}
          name={item.name}
          render={({ field }) => (
            <>
              {renderItem(item, {
                rhf: field,
                required: requiredMap?.get(item.name) ?? false,
              })}
            </>
          )}
        />
      )}
    />
  );
}
