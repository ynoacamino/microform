import type { NotifyAdapter, StorageAdapter } from "../data/ports";
import type { FieldRendererFn } from "./control";

export interface Microform<TType extends string = string> {
  register: <T extends TType>(type: T, renderer: FieldRendererFn) => void;
  registerAll: (renderers: Partial<Record<TType, FieldRendererFn>>) => void;
  resolve: (type: TType) => FieldRendererFn | undefined;
  has: (type: TType) => boolean;
  types: () => TType[];
}

export function createMicroform<BuiltIn extends string, Custom extends string = never>(options: {
  controls: ReadonlyArray<{ type: BuiltIn; renderer: FieldRendererFn }>;
  storage?: StorageAdapter;
  notify?: NotifyAdapter;
}): Microform<BuiltIn | Custom> {
  const map = new Map<BuiltIn | Custom, FieldRendererFn>();

  for (const control of options.controls) {
    map.set(control.type, control.renderer);
  }

  return {
    register(type, renderer) {
      map.set(type, renderer);
    },
    registerAll(renderers) {
      for (const [type, renderer] of Object.entries(renderers) as [BuiltIn | Custom, FieldRendererFn | undefined][]) {
        if (renderer) map.set(type, renderer);
      }
    },
    resolve(type) {
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

export function resolveRenderer<TType extends string>(
  microform: Pick<Microform<TType>, "resolve">,
  type: TType,
): FieldRendererFn | undefined {
  return microform.resolve(type);
}
