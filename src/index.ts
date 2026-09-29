// microform — núcleo headless (solo lógica, cero estilos).
// Este barrel es la única API pública. No re-exporta UI.

export { createMemoryStorage } from "./adapters/memory-storage.ts";
export type { NotifyAdapter, StorageAdapter } from "./adapters/ports.ts";
export type { BuiltInType } from "./controls/builtin-types.ts";
export { BUILT_IN_TYPES } from "./controls/builtin-types.ts";
export type { ControlDefinition } from "./controls/define-control.ts";
export { defineControl } from "./controls/define-control.ts";
export type { RichTextType } from "./controls/rich-text.ts";
export { RICH_TEXT_TYPE } from "./controls/rich-text.ts";
export { createAsyncConfig } from "./fields/create-async-config.ts";
export { createPersistenceKey, readPersistedValue, writePersistedValue } from "./fields/persistence.ts";
export { flattenStructure, MAX_COLUMNS, validateColumns } from "./fields/structure.ts";
export { cleanFormVariables } from "./forms/clean-form-variables.ts";
export type { ZodObjectSchema } from "./forms/form-defaults.ts";
export {
  buildEditDefaults,
  buildRequiredMap,
  createFormDefaults,
  unwrapZodType,
} from "./forms/form-defaults.ts";
export type { MutationErrorLike, SubmitFlowArgs } from "./forms/submit.ts";
export { formatMutationError, handleSubmitFlow } from "./forms/submit.ts";
export type { AsyncQueryPort } from "./ports/async-query.ts";
export type { ChromePort } from "./ports/chrome.ts";
export type { ComponentPort } from "./ports/component.ts";
export type { FormShellPort } from "./ports/form-shell.ts";
export type { LayoutPort } from "./ports/layout.ts";
export type { MutationPort } from "./ports/mutation.ts";
export type { Registry } from "./registry/create-registry.ts";
export { createRegistry } from "./registry/create-registry.ts";
export type { Microform } from "./registry/microform.ts";
export { createMicroform } from "./registry/microform.ts";
export { resolveRenderer } from "./registry/resolve-renderer.ts";
export { forwardScalarValue } from "./types/control.ts";
export type {
  BaseField,
  ControlFieldConfig,
  FieldRow,
  FieldStructure,
  FieldType,
} from "./types/field.ts";
export type {
  AsyncCheckboxGroupData,
  BaseOption,
  CheckboxGroupOption,
  DrawerSelectOption,
  ModalPickerSettings,
  PersonOption,
} from "./types/options.ts";
export type {
  ExtractQueryData,
  ExtractQueryItem,
  ExtractQueryVariables,
} from "./types/query.ts";
export { cleanVariables } from "./utils/clean-variables.ts";
export type { SelectOption } from "./utils/create-enum-options.ts";
export { createEnumOptions } from "./utils/create-enum-options.ts";
export { extractItemsFromData } from "./utils/extract-items.ts";
export { getOptionLabel } from "./utils/get-option-label.ts";
