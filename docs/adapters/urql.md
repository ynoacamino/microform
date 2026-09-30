# Adapter urql (ejemplo — vive en la app, no en el core)

El core nunca importa `urql`. La app adapta su cliente a los puertos
`QuerySource` / `MutationPort` de `microform`.

```ts
import { useQuery, useMutation } from "urql";
import {
  cleanVars,
  createAsyncSource,
  extractItemsFromData,
  handleSubmitFlow,
  type QuerySource,
} from "microform";

// 1. Fuente paginada agnóstica sobre tu query urql
const GET_USERS = `query ($take: Int, $skip: Int, $filter: UserFilter) {
  users(take: $take, skip: $skip, filter: $filter) { items { id name } totalCount }
}`;

function fetchUsers(variables: Record<string, unknown>) {
  // usa tu client urql fuera de React, o useQuery dentro de un hook
  return client.query(GET_USERS, variables).toPromise().then((r) => r.data);
}

const userSource: QuerySource<{ value: string; label: string }> = {
  fetch: async ({ search = "", page = 1, pageSize = 20 }) => {
    const raw = await fetchUsers(
      cleanVars({ take: pageSize, skip: (page - 1) * pageSize, filter: { search } }),
    );
    const items = extractItemsFromData(raw) as { id: string; name: string }[];
    const total = (raw as { users?: { totalCount?: number } })?.users?.totalCount;
    return { items: (items ?? []).map((u) => ({ value: u.id, label: u.name })), total };
  },
};

// 2. O con createAsyncSource (mapItem + total automático)
const userAsync = createAsyncSource({
  fetch: fetchUsers,
  pageSize: 20,
  mapItem: (u) => ({ value: (u as { id: string }).id, label: (u as { name: string }).name }),
});

// 3. En React: useAsyncQuery (debounce + cancelación incluidos)
// import { useAsyncQuery } from "microform/react";
// const { data, isLoading } = useAsyncQuery({ source: userSource, search, page: 1 });

// 4. Mutación vía MutationPort + Notify del adapter (sonner, toast, etc.)
// const [, execute] = useMutation(CREATE_USER);
// await handleSubmitFlow({
//   mutation: (vars) => execute(vars),
//   vars: formData, // se limpia con empty:"null" ("" → null GraphQL)
//   notify,
//   successMessage: "Guardado",
// });
```
