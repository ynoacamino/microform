function hasItemsArray(value: unknown): value is { items: unknown[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    "items" in value &&
    Array.isArray((value as { items: unknown }).items)
  );
}

/**
 * Extrae la lista de items desde respuestas heterogéneas:
 * `{ users: { items: [...] } }`, `{ data: [...] }`, `[...]`, etc.
 * Retorna `null` si no encuentra arreglo.
 */
export function extractItemsFromData(data: unknown): unknown[] | null {
  if (!data || typeof data !== "object") return null;
  if (Array.isArray(data)) return data;
  for (const value of Object.values(data)) {
    if (hasItemsArray(value)) return value.items;
    if (Array.isArray(value)) return value;
  }
  return null;
}
