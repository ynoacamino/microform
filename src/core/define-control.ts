import type { FieldRendererFn } from "./control";

export interface ControlDefinition<
  Type extends string,
  Config extends { type: Type },
  Props = Record<string, unknown>,
  // biome-ignore lint/suspicious/noExplicitAny: custom controls declare their own Value
  Value = any,
  Element = unknown,
> {
  type: Type;
  config?: Config;
  renderer: FieldRendererFn<Props, Value, Element>;
}

export function defineControl<
  const Type extends string,
  Config extends { type: Type },
  Props = Record<string, unknown>,
  // biome-ignore lint/suspicious/noExplicitAny: custom controls declare their own Value
  Value = any,
  Element = unknown,
>(def: ControlDefinition<Type, Config, Props, Value, Element>): ControlDefinition<Type, Config, Props, Value, Element> {
  return def;
}
