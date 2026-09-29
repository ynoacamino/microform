// Contrato async style-agnóstico: el usuario provee `useQuery`.
// Renombre formal de `AsyncConfig`; no lo importa para evitar el acoplamiento.
export interface AsyncQueryPort<T = unknown> {
  useQuery: (
    search?: string,
    page?: number,
  ) => {
    data: T;
    totalItems?: number;
    isLoading: boolean;
  };
}
