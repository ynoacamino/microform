import type { AsyncConfig, FileLike } from "../core/control";
import type { QuerySource } from "../data/ports";
import type {
  CheckboxGroupOption,
  DrawerSelectOption,
  ModalPickerSettings,
  PersonOption,
  SelectOption,
} from "./options";

export type AsyncSource<T = unknown> = QuerySource<T> | AsyncConfig<T>;

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
  | { type: "async_select"; asyncSource: AsyncSource<SelectOption[]>; allOptionLabel?: string };

export type ComboboxConfig =
  | { type: "combobox"; options: SelectOption[] }
  | { type: "async_combobox"; asyncSource: AsyncSource<SelectOption[]> };

export type PersonSelectConfig =
  | { type: "person_select"; options: PersonOption[] }
  | { type: "async_person_select"; asyncSource: AsyncSource<PersonOption[]> };

export type ModalPickerConfig =
  | { type: "modal_picker"; options: PersonOption[]; modalConfig?: ModalPickerSettings }
  | {
      type: "async_modal_picker";
      asyncSource: AsyncSource<{ items: Record<string, unknown>[]; totalItems: number }>;
      modalConfig: ModalPickerSettings;
    };

export interface DrawerSelectSettings {
  title?: string;
  description?: string;
}

export type DrawerSelectTriggerVariant = "default" | "pill";

export interface DrawerSelectConfig {
  type: "drawer_select";
  options: DrawerSelectOption[];
  drawerConfig?: DrawerSelectSettings;
  triggerVariant?: DrawerSelectTriggerVariant;
}

export type CheckboxGroupConfig =
  | { type: "checkbox_group"; options?: CheckboxGroupOption[]; emptyMessage?: string }
  | {
      type: "async_checkbox_group";
      asyncSource: AsyncSource<CheckboxGroupOption[]>;
      getOption?: (item: Record<string, unknown>) => CheckboxGroupOption;
      options?: CheckboxGroupOption[];
      emptyMessage?: string;
    };

export interface UploadFileSettings {
  uploadType?: string;
  maxSize?: number;
}

export interface UploadFileConfig {
  type: "upload_file";
  config?: UploadFileSettings;
}

export type AvatarUploadFn = (file: FileLike) => Promise<{ id: string }>;

export interface AvatarUploadSettings {
  currentImageUrl?: string | null;
  userName?: string;
  uploadFn?: AvatarUploadFn;
}

export interface AvatarUploadConfig {
  type: "avatar_upload";
  config?: AvatarUploadSettings;
}

export interface RichTextConfig {
  type: "rich_text";
}

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
  | PersonSelectConfig
  | ModalPickerConfig
  | DrawerSelectConfig
  | CheckboxGroupConfig
  | UploadFileConfig
  | AvatarUploadConfig;

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
  "person_select",
  "modal_picker",
  "drawer_select",
  "upload_file",
  "avatar_upload",
  "async_select",
  "async_combobox",
  "async_checkbox_group",
  "async_person_select",
  "async_modal_picker",
] as const;
