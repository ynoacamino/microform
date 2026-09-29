// Wrappers opacos de chrome (Card, Dialog) inyectados por el adapter.
// El core los trata como `unknown`; el adapter los estrecha a componentes.
export interface ChromePort {
  Card?: unknown;
  Dialog?: unknown;
}
