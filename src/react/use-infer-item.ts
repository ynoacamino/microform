import { useCallback } from "react";
import { writePersistedValue } from "../data/persistence";
import type { StorageAdapter } from "../data/ports";

export interface UseInferItemArgs<
  // biome-ignore lint/suspicious/noExplicitAny: value type depends on the injected control
  Value = any,
> {
  persistKey?: string;
  storage?: StorageAdapter;
  prefix?: string;
  onChange?: (val: Value | undefined) => void;
}

export interface UseInferItemResult<
  // biome-ignore lint/suspicious/noExplicitAny: value type depends on the injected control
  Value = any,
> {
  persistOnChange: ((val: Value | undefined) => void) | undefined;
}

/**
 * Headless item logic (core con slots): wraps `onChange` with persistence
 * write. The adapter owns label/description/error/required markup and calls
 * `persistOnChange` instead of raw `onChange`.
 *
 * Storage is injected per use (Option A): no globals, no registry wiring.
 * Without `storage` + `persistKey` it returns `onChange` untouched.
 */
export function useInferItem<
  // biome-ignore lint/suspicious/noExplicitAny: value type depends on the injected control
  Value = any,
>({ persistKey, storage, prefix, onChange }: UseInferItemArgs<Value>): UseInferItemResult<Value> {
  const persistOnChange = useCallback(
    (val: Value | undefined) => {
      onChange?.(val);
      if (storage && persistKey) {
        writePersistedValue(storage, persistKey, val, prefix);
      }
    },
    [onChange, persistKey, prefix, storage],
  );

  if (!onChange) return { persistOnChange: undefined };
  if (!storage || !persistKey) return { persistOnChange: onChange };
  return { persistOnChange };
}
