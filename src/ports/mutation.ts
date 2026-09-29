// Puerto de mutación: el adapter provee el cliente (urql, fetch, etc.).
// El core solo exige `mutate`; nunca importa el cliente directo.
export interface MutationPort {
  mutate: (variables: Record<string, unknown>) => Promise<unknown>;
}
