import type { FieldRendererFn } from "./control";

export interface ControlDefinition<
  Type extends string,
  Config extends { type: Type },
  Props = Record<string, unknown>,
  Element = unknown,
> {
  type: Type;
  config?: Config;
  renderer: FieldRendererFn<Props, Element>;
}

export function defineControl<
  const Type extends string,
  Config extends { type: Type },
  Props = Record<string, unknown>,
  Element = unknown,
>(def: ControlDefinition<Type, Config, Props, Element>): ControlDefinition<Type, Config, Props, Element> {
  return def;
}
