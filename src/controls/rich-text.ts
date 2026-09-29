// Tipo opt-in fuera de la base: el core no lo registra por defecto.
export const RICH_TEXT_TYPE = "rich_text" as const;

export type RichTextType = typeof RICH_TEXT_TYPE;
