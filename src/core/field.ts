export interface BaseField<T extends string> {
  name: T;
  label: string;
  icon?: unknown;
  description?: string;
  placeholder?: string;
  allOptionLabel?: string;
  readonly?: boolean;
  disabled?: boolean;
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

export interface FieldSection<T extends string> {
  kind: "section";
  key?: string;
  title?: string;
  description?: string;
  children: StructureNode<T>[];
}

export type StructureNode<T extends string> = FieldType<T> | FieldRow<T> | FieldSection<T>;

export type FieldStructure<T extends string> = StructureNode<T>[];

export function isFieldRow<T extends string>(item: StructureNode<T>): item is FieldRow<T> {
  return "fields" in item;
}

export function isFieldSection<T extends string>(item: StructureNode<T>): item is FieldSection<T> {
  return typeof item === "object" && item !== null && "kind" in item && (item as { kind?: unknown }).kind === "section";
}
