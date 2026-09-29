// Solo constantes de tipos. El core no pinta: los renderers viven
// en el adapter y se registran por estas claves.
// `rich_text` queda fuera de la base (opt-in en `./rich-text.ts`).
export const BUILT_IN_TYPES = [
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

export type BuiltInType = (typeof BUILT_IN_TYPES)[number];
