import type { QuerySource } from "../data/ports";
import type { CheckboxGroupOption, SelectOption } from "./options";

/**
 * Canonical async contract: promise-based, framework-agnostic.
 * Consume with `useAsyncQuery({ source })` in `microform/react`.
 * Migration from hook-based sources (urql `useQuery`, react-query):
 * expose `{ fetch: async ({search,page,pageSize,signal}) => ({items,total}) }`
 * via `createAsyncSource` + `asQuerySource`, or wrap any client fetch.
 */
export type AsyncSource<TItem = unknown> = QuerySource<TItem>;

export interface TextConfig {
  type: "text";
}

export interface EmailConfig {
  type: "email";
  autoComplete?: string;
}

export interface PasswordConfig {
  type: "password";
  autoComplete?: string;
}

export interface TextareaConfig {
  type: "textarea";
}

export interface NumberConfig {
  type: "number";
}

export interface SearchConfig {
  type: "search";
}

export interface CalendarSettings {
  minDate?: string;
  maxDate?: string;
}

export interface CalendarConfig {
  type: "calendar";
  calendarConfig?: CalendarSettings;
}

export type SelectConfig =
  | { type: "select"; options: SelectOption[] }
  | { type: "async_select"; asyncSource: AsyncSource<SelectOption>; allOptionLabel?: string };

export type ComboboxConfig =
  | { type: "combobox"; options: SelectOption[] }
  | { type: "async_combobox"; asyncSource: AsyncSource<SelectOption> };

export type CheckboxGroupConfig =
  | { type: "checkbox_group"; options?: CheckboxGroupOption[]; emptyMessage?: string }
  | {
      type: "async_checkbox_group";
      asyncSource: AsyncSource<CheckboxGroupOption>;
      getOption?: (item: Record<string, unknown>) => CheckboxGroupOption;
      options?: CheckboxGroupOption[];
      emptyMessage?: string;
    };

/**
 * Minimal core: only primitive, UI-agnostic configs.
 * Specialized controls (rich_text, person_select, modal_picker,
 * drawer_select, upload_file, avatar_upload) are intentionally NOT
 * built-ins — see `src/examples/custom-controls.ts` for copy-paste
 * recipes to `defineControl` + `register` them in userland.
 */
export type ControlConfig =
  | TextConfig
  | EmailConfig
  | PasswordConfig
  | TextareaConfig
  | NumberConfig
  | SearchConfig
  | CalendarConfig
  | SelectConfig
  | ComboboxConfig
  | CheckboxGroupConfig;

export type BuiltInType = ControlConfig["type"];

export const BUILT_IN_TYPES: readonly BuiltInType[] = [
  "text",
  "email",
  "password",
  "textarea",
  "number",
  "search",
  "calendar",
  "select",
  "combobox",
  "checkbox_group",
  "async_select",
  "async_combobox",
  "async_checkbox_group",
] as const;
