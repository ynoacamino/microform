// Tipos declarativos de estructura. Sin React, sin Lucide, sin estilos.
// `icon` queda como `unknown`: cada adapter lo estrecha (ReactNode, string, null...).

export interface BaseField<T extends string> {
  name: T;
  label: string;
  /** Icono opaco para el core. El adapter decide cómo pintarlo. */
  icon?: unknown;
  description?: string;
  placeholder?: string;
  readonly?: boolean;
  /** Opt-in de persistencia. El core nunca toca localStorage directo. */
  persistKey?: string;
}

/**
 * Unión discriminada por `type`. El core no conoce los tipos concretos:
 * cada app/lib registra los suyos (built-ins + customFields).
 * `ControlFieldConfig` mínimo: solo exige `type: string`.
 */
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
