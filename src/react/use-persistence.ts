import { useEffect, useRef } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { useWatch } from "react-hook-form";
import type { FieldValue } from "@/core/control.ts";
import { readPersistedValue, writePersistedValue } from "@/data/persistence.ts";
import type { StorageAdapter } from "@/data/ports.ts";

export interface UsePersistenceArgs<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  persistKey?: string;
  storage: StorageAdapter;
  prefix?: string;
  onRestore?: (value: string | number | string[]) => void;
}

export function usePersistence<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  persistKey,
  storage,
  prefix,
  onRestore,
}: UsePersistenceArgs<TFieldValues>): void {
  const value = useWatch({ control, name }) as FieldValue | unknown;
  // `onRestore` vive en ref: es callback del dueño (cambia por render)
  // y no debe re-disparar la restauración.
  const restoreRef = useRef(onRestore);
  restoreRef.current = onRestore;

  useEffect(() => {
    if (!persistKey) return;
    const restored = readPersistedValue(storage, persistKey, prefix);
    if (restored !== undefined) restoreRef.current?.(restored);
  }, [persistKey, prefix, storage]);

  useEffect(() => {
    if (!persistKey) return;
    writePersistedValue(storage, persistKey, value, prefix);
  }, [persistKey, prefix, storage, value]);
}
