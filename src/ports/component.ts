// Piezas opacas de presentación de campo inyectadas por el adapter.
// El core las trata como `unknown`; el adapter las estrecha a componentes.
export interface ComponentPort {
  Label?: unknown;
  Description?: unknown;
  Error?: unknown;
}
