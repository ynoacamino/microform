import type { FieldRendererFn } from "../types/control.ts";

/**
 * Registry por instancia (no global mutable).
 * Permite built-ins + customFields sin colisiones entre apps/tests.
 *
 * @example
 * const registry = createRegistry();
 * registry.register("text", renderText);
 * registry.register("color", renderColor); // customField
 * registry.get("text");
 */
export interface Registry<TType extends string = string> {
  register: (type: TType, renderer: FieldRendererFn) => void;
  registerAll: (renderers: Partial<Record<TType, FieldRendererFn>>) => void;
  get: (type: TType) => FieldRendererFn | undefined;
  has: (type: TType) => boolean;
  types: () => TType[];
}

export function createRegistry<TType extends string = string>(
  initial?: Partial<Record<TType, FieldRendererFn>>,
): Registry<TType> {
  const map = new Map<TType, FieldRendererFn>();

  if (initial) {
    for (const [type, renderer] of Object.entries(initial) as [TType, FieldRendererFn | undefined][]) {
      if (renderer) map.set(type, renderer);
    }
  }

  return {
    register(type, renderer) {
      map.set(type, renderer);
    },
    registerAll(renderers) {
      for (const [type, renderer] of Object.entries(renderers) as [TType, FieldRendererFn | undefined][]) {
        if (renderer) map.set(type, renderer);
      }
    },
    get(type) {
      return map.get(type);
    },
    has(type) {
      return map.has(type);
    },
    types() {
      return [...map.keys()];
    },
  };
}
