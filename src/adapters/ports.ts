// Puertos (interfaces) que el usuario inyecta. El core nunca importa
// localStorage, sonner, urql ni shadcn directo.

/** Storage mínimo para `persistKey`. */
export interface StorageAdapter {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  remove?: (key: string) => void;
}

/** Notificaciones mínimas para submit. */
export interface NotifyAdapter {
  success: (message: string) => void;
  error: (message: string, description?: string) => void;
}
