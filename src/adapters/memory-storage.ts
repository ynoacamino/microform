import type { StorageAdapter } from "@/data/ports.ts";

export function createMemoryStorage(
  seed: Record<string, string> = {},
): StorageAdapter & { dump: () => Record<string, string> } {
  const map = new Map<string, string>(Object.entries(seed));
  return {
    get: (key) => map.get(key) ?? null,
    set: (key, value) => {
      map.set(key, value);
    },
    remove: (key) => {
      map.delete(key);
    },
    dump: () => Object.fromEntries(map),
  };
}
