import type { ReactNode } from "react";
import type { FieldStructure, FieldType } from "../types/field.ts";
import { isFieldRow } from "../types/field.ts";

export interface FieldGridProps<T extends string> {
  structure: FieldStructure<T>;
  renderField: (field: FieldType<T>) => ReactNode;
  alignItemsEnd?: boolean;
  /** Slot de la última fila (p. ej. botón submit del adapter). */
  children?: ReactNode;
}

/**
 * Layout delgado headless: estructura + `data-*`, cero estilos.
 * El adapter mapea `data-columns`/`data-colspan` a su sistema visual.
 */
export function FieldGrid<T extends string>({
  structure,
  renderField,
  alignItemsEnd = false,
  children,
}: FieldGridProps<T>): ReactNode {
  return (
    <>
      {structure.map((item, index) => {
        if (!isFieldRow(item)) {
          return (
            <div key={item.name} data-field={item.name}>
              {renderField(item)}
            </div>
          );
        }
        const rowId = item.fields.map((field) => field.name).join("+");
        const isLastRow = index === structure.length - 1;
        return (
          <div
            key={`row-${rowId}`}
            data-row=""
            data-columns={item.columns}
            data-align={alignItemsEnd ? "end" : "start"}
          >
            {item.fields.map((field) => (
              <div key={field.name} data-field={field.name} data-colspan={field.colspan ?? 1}>
                {renderField(field)}
              </div>
            ))}
            {isLastRow ? children : null}
          </div>
        );
      })}
    </>
  );
}
