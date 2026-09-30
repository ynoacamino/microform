export interface BaseField<T extends string> {
  name: T;
  label: string;
  icon?: unknown;
  description?: string;
  placeholder?: string;
  readonly?: boolean;
  persistKey?: string;
}

export interface ControlFieldConfig {
  type: string;
}

export type FieldType<T extends string> = BaseField<T> & ControlFieldConfig;

export interface FieldRow<T extends string> {
  columns: number;
  fields: (FieldType<T> & { colspan?: number })[];
}

export type FieldStructure<T extends string> = (FieldType<T> | FieldRow<T>)[];

export function isFieldRow<T extends string>(item: FieldType<T> | FieldRow<T>): item is FieldRow<T> {
  return "fields" in item;
}
