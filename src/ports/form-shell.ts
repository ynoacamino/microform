/**
 * Slot del form-shell inyectado por el adapter.
 *
 * El `Controller` de react-hook-form vive en `src/react` (futuro);
 * el core solo declara el slot como `unknown` y el adapter lo estrecha
 * a componentes reales (`FormProvider`, `useController`, ...).
 */
export interface FormShellPort {
  Provider?: unknown;
  useController?: unknown;
}
