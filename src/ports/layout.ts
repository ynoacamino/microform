// Wrappers opacos de layout (Grid, Row) inyectados por el adapter.
// El core los trata como `unknown`; el adapter los estrecha a componentes.
export interface LayoutPort {
  Grid?: unknown;
  Row?: unknown;
}
