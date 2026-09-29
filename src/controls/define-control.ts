import type { FieldRendererFn } from "../types/control.ts";

/**
 * Definición de un control: liga `Type ↔ Config ↔ Props`.
 * Único constructor válido para built-ins y customs.
 */
export interface ControlDefinition<
  Type extends string,
  Config extends { type: Type },
  Props = Record<string, unknown>,
  Element = unknown,
> {
  type: Type;
  /**
   * Ejemplo de forma válida para el tipo (p. ej. `{ type: "text" }`).
   * Nunca requerido en runtime: solo fija el vínculo `Type ↔ Config`.
   */
  config?: Config;
  renderer: FieldRendererFn<Props, Element>;
}

/** Constructor identidad: no transforma, solo fija el vínculo de tipos. */
export function defineControl<
  const Type extends string,
  Config extends { type: Type },
  Props = Record<string, unknown>,
  Element = unknown,
>(def: ControlDefinition<Type, Config, Props, Element>): ControlDefinition<Type, Config, Props, Element> {
  return def;
}
