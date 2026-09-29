import type { FieldRendererFn } from "../types/control.ts";
import type { Microform } from "./microform.ts";

/**
 * Vía única sync+async: la distinción vive en `Config`
 * (`options` vs `asyncConfig`), no en la resolución.
 */
export function resolveRenderer<TType extends string>(
  microform: Pick<Microform<TType>, "resolve">,
  type: TType,
): FieldRendererFn | undefined {
  return microform.resolve(type);
}
