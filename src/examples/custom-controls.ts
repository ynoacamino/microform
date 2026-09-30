import type {
  CheckboxGroupOption,
  DrawerSelectOption,
  ModalPickerSettings,
  PersonOption,
  SelectOption,
} from "../catalog/options";
import type { FileLike } from "../core/control";
import { defineControl } from "../core/define-control";
import type { QuerySource } from "../data/ports";

/**
 * Copy-paste recipes for specialized controls.
 * NOT built-ins: define + register them in userland.
 *
 * ```ts
 * import { createMicroform } from "microform";
 * import { richTextControl } from "microform/examples/custom-controls";
 *
 * const microform = createMicroform({
 *   controls: [richTextControl({ renderer: (ctx) => renderLexical(ctx) })],
 * });
 * ```
 */

// --- rich_text (specialized editor: Lexical / Tiptap / textarea) ---

export interface RichTextConfig {
  type: "rich_text";
}

export function richTextControl(
  renderer: (ctx: {
    props: RichTextConfig;
    value?: string;
    onChange?: (val: string | undefined) => void;
    disabled?: boolean;
    name?: string;
  }) => unknown,
) {
  return defineControl<"rich_text", RichTextConfig, RichTextConfig, string>({
    type: "rich_text",
    // biome-ignore lint/suspicious/noExplicitAny: adapter bridges generic core to string value
    renderer: renderer as any,
  });
}

// --- person_select (avatar list, sync/async) ---

export type PersonSelectConfig =
  | { type: "person_select"; options: PersonOption[] }
  | { type: "async_person_select"; asyncSource: QuerySource<PersonOption> };

export type PersonSelectValue = string;

// --- modal_picker (dialog + pagination, sync/async) ---

export type ModalPickerConfig =
  | { type: "modal_picker"; options: PersonOption[]; modalConfig?: ModalPickerSettings }
  | {
      type: "async_modal_picker";
      asyncSource: QuerySource<Record<string, unknown>>;
      modalConfig: ModalPickerSettings;
    };

// --- drawer_select (mobile-first drawer, sync only) ---

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

// --- upload_file (dropzone, emits FileLike[]) ---

export interface UploadFileSettings {
  uploadType?: string;
  maxSize?: number;
}

export interface UploadFileConfig {
  type: "upload_file";
  config?: UploadFileSettings;
}

export type UploadFileValue = FileLike[];

// --- avatar_upload (immediate upload, emits media id) ---

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

export type AvatarUploadValue = string;

// Re-export option shapes so recipes are self-contained.
export type { CheckboxGroupOption, DrawerSelectOption, ModalPickerSettings, PersonOption, SelectOption };
