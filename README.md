# microform

[![CI](https://github.com/ynoacamino/microform/actions/workflows/ci.yml/badge.svg)](https://github.com/ynoacamino/microform/actions/workflows/ci.yml)

Headless form and field engine with typed registry, Zod defaults, async sources, and pluggable storage adapters.

No styles, no UI kit, no transport. `microform` owns the logic — types, registry, defaults, cleaning, persistence, async data, submit flow — and the app owns the rendering through adapters.

## Features

- **Typed control registry** — register built-in and custom field types, resolve renderers by type.
- **Zod-first defaults** — creation defaults, edit defaults, and required maps derived from your schema.
- **Ports and adapters** — storage, notify, mutation, and query are interfaces. Memory adapters ship in the box, real ones live in your app.
- **Async sources** — paginated, searchable option sources with debounce and cancellation in React.
- **Submit flow** — clean variables, run the mutation, notify, reset, invalidate.
- **Draft persistence** — per-field persistence over any `StorageAdapter`.
- **Framework split** — `microform` is React-free. React bindings live in `microform/react`.

## Installation

Distributed through GitHub releases. No npm publish.

```bash
# bun
bun add github:ynoacamino/microform#v0.1.1 zod

# npm
npm install github:ynoacamino/microform#v0.1.1

# pnpm
pnpm add github:ynoacamino/microform#v0.1.1
```

Pin a tag for reproducible installs. The package is consumed straight from `src/` through the `exports` map, so there is no build step and no `dist/` in the repo. Peer dependencies resolve from npm as usual:

| Peer            | Version | Needed for        |
| --------------- | ------- | ----------------- |
| `zod`           | `^4`    | `microform`       |
| `react`         | `^19`   | `microform/react` |
| `react-hook-form` | `^7`  | `microform/react` |

`react` and `react-hook-form` are only required when you import `microform/react`.

## How it works

```
core/    typed controls, fields, structures, registry
  ↓
schema/  Zod defaults for create and edit + required map
  ↓
data/    ports, cleaning, async sources, persistence, submit flow
  ↓
react/   thin RHF binding: provider, grids, hooks
  ↓
adapters your app: shadcn renderers, urql client, sonner toasts, storage
```

Rules:

- `core/` never imports React, Zod, DOM, or fetch.
- `schema/` is the only place that imports Zod.
- `data/` is the only place with real side-effect ports.
- `react/` is thin and style-free.
- Transport such as urql or GraphQL lives only in the app adapter. See `docs/adapters/urql.md`.

## Usage

### Core: registry, defaults, cleaning

```ts
import { z } from "zod";
import {
  buildRequiredMap,
  BUILT_IN_TYPES,
  cleanVars,
  createEnumOptions,
  createFormDefaults,
  createMicroform,
  defineControl,
} from "microform";

const schema = z.object({ name: z.string(), nickname: z.string().optional() });

const defaults = createFormDefaults(schema);
// { name: "", nickname: undefined }

const required = buildRequiredMap(schema);
// Map { "name" => true, "nickname" => false }

const LABELS = { DNI: "DNI", CE: "Carné de extranjería" } as const;
const options = createEnumOptions<keyof typeof LABELS>(LABELS);
// [{ key: "dni", value: "DNI", label: "DNI" }, ...]

const microform = createMicroform({
  controls: [defineControl({ type: "text", renderer: (ctx) => ({ ...ctx }) })],
});
microform.register("color", (ctx) => ({ ...ctx, custom: true }));

const vars = cleanVars({ search: "  ", take: 50 });
// { take: 50 } — blank strings are omitted
const mutationVars = cleanVars({ nick: "" }, { empty: "null" });
// { nick: null } — blanks become null for GraphQL mutations
```

### React: provider, structured forms, async queries

```tsx
import { useForm } from "react-hook-form";
import {
  MicroformProvider,
  StructForm,
  useAsyncQuery,
  usePersistence,
} from "microform/react";
import { microform } from "./microform-setup";
import { createMemoryStorage } from "microform";

const storage = createMemoryStorage();

function UserForm() {
  const form = useForm({ defaultValues: { name: "" } });

  usePersistence({ control: form.control, name: "name", storage });

  return (
    <MicroformProvider value={microform}>
      <StructForm
        structure={[{ type: "text", name: "name" }]}
        form={form}
        renderItem={(field, { rhf, required }) => (
          <input {...rhf} required={required} />
        )}
        onSubmit={(data) => console.log(data)}
        submitLabel="Save"
      />
    </MicroformProvider>
  );
}

function UserPicker() {
  const { data, isLoading } = useAsyncQuery({
    source: userSource,
    search: "",
    page: 1,
  });
  // ...
}
```

## Patterns

### Registry and custom types

`createMicroform` bootstraps the registry with your controls. `register` and `registerAll` add custom types later, `resolve` and `has` look them up, `types` lists them. Renderers stay in the app — the core only maps type names to renderer functions.

```ts
const microform = createMicroform({ controls: [...] });
microform.register("signature-pad", signatureRenderer);
const renderer = microform.resolve("signature-pad");
```

### Ports and adapters

Every side effect is a port. Implement the interface with your stack and inject it:

```ts
import { createMemoryStorage } from "microform";
import type { MutationPort, NotifyAdapter, QuerySource } from "microform";

const storage = createMemoryStorage({ "form-persist:name": "Ada" });

const sonnerNotify: NotifyAdapter = {
  success: (message) => toast.success(message),
  error: (message, description) => toast.error(message, { description }),
};

const userSource: QuerySource<{ value: string; label: string }> = {
  fetch: async ({ search = "", page = 1, pageSize = 20 }) => {
    // call your client here
    return { items: [], total: 0 };
  },
};

const createUser: MutationPort = {
  mutate: (variables) => client.mutation(CREATE_USER, variables).toPromise(),
};
```

### Cleaning variables

`cleanVars` normalizes one value, recursively for objects and arrays:

- default `omit` mode turns `""` into `undefined` and drops blank entries — ideal for filters and search forms.
- `null` mode turns `""` into `null` — ideal for GraphQL mutation inputs.

### Async sources

`createAsyncSource` wraps a raw fetch with item mapping and total detection. It understands `{ items }`, plain arrays, and `total` / `totalItems` / `totalCount` shapes:

```ts
const userAsync = createAsyncSource({
  fetch: fetchUsers,
  pageSize: 20,
  mapItem: (u) => ({ value: u.id, label: u.name }),
});

const { data, totalItems } = await userAsync.fetch("ada", 1);
```

In React, `useAsyncQuery({ source, search, page, pageSize, debounceMs })` adds debounce, stale-response guards, and loading state.

### Submit flow

`handleSubmitFlow` runs the full mutation lifecycle and returns `true` on success:

```ts
const ok = await handleSubmitFlow({
  mutation: (vars) => execute(vars),
  vars: formData, // cleaned with empty:"null" internally
  notify: sonnerNotify,
  successMessage: "Saved",
  resetForm: () => form.reset(),
  invalidate: () => refetchUsers(),
});
```

Errors are formatted with `formatMutationError`, which understands GraphQL errors, network errors, and plain `Error` objects.

### Draft persistence

`usePersistence({ control, name, storage, persistKey, prefix })` restores a field from storage on mount and writes back on change. The low-level helpers `createPersistenceKey`, `readPersistedValue`, and `writePersistedValue` are available for custom flows.

### Enum options

```ts
const options = createEnumOptions<"DNI" | "CE">({ DNI: "DNI", CE: "Carné" });
getOptionLabel({ DNI: "DNI" }, "DNI"); // "DNI"
```

### Structures and grids

Fields compose into structures of single fields and rows. `validateColumns` enforces the 12-column grid, `flattenStructure` linearizes a structure, and `isFieldRow` discriminates rows from fields. `FieldGrid` renders the layout, `FormFields` binds each field to React Hook Form with required flags from the schema.

## Architecture

```text
src/
  index.ts    # core + schema + data + catalog + adapters, never React
  react.ts    # official RHF binding
  core/       # control, field, structure, infer, registry, define-control
  schema/     # zod-defaults for create, edit-defaults for edit
  data/       # ports, clean, extract-items, async-source, submit, persistence
  catalog/    # configs, options, enum-options — types, no renderers
  react/      # provider, infer-field, form-fields, struct-form, field-grid,
              # use-async-query, use-persistence
  adapters/   # memory-storage — the rest is provided by the app
docs/adapters/urql.md  # example: urql mapped to QuerySource and MutationPort
```

## API reference

### `microform`

| Area         | Exports                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| Registry     | `createMicroform`, `resolveRenderer`, `defineControl`, `forwardScalarValue`                                      |
| Schema       | `createFormDefaults`, `buildEditDefaults`, `extractIdsFromArray`, `buildRequiredMap`, `unwrapZodType`            |
| Data         | `cleanVars`, `extractItemsFromData`, `createAsyncSource`, `formatMutationError`, `handleSubmitFlow`               |
| Persistence  | `createPersistenceKey`, `readPersistedValue`, `writePersistedValue`, `createMemoryStorage`                       |
| Structure    | `flattenStructure`, `validateColumns`, `MAX_COLUMNS`, `isFieldRow`, `inferInputValue`                             |
| Catalog      | `BUILT_IN_TYPES`, `createEnumOptions`, `getOptionLabel`                                                          |
| Types        | `Microform`, `ControlDefinition`, `FieldStructure`, `StorageAdapter`, `NotifyAdapter`, `MutationPort`, `QuerySource`, and more |

### `microform/react`

| Export               | Kind      | Purpose                                                        |
| -------------------- | --------- | -------------------------------------------------------------- |
| `MicroformProvider`  | component | provides the registry — `useMicroform` throws outside of it    |
| `useMicroform`       | hook      | required access to the registry                                |
| `useMicroformOptional` | hook    | nullable access to the registry                                |
| `StructForm`         | component | full form: structure + RHF + submit                            |
| `FormFields`         | component | renders fields with RHF controllers and required flags         |
| `FieldGrid`          | component | 12-column layout for a structure                               |
| `InferFieldInput`    | component | input inferred from a Zod type                                 |
| `useAsyncQuery`      | hook      | debounced async source with loading state                      |
| `usePersistence`     | hook      | per-field draft restore and autosave                           |

## Scripts

```bash
bun install
bun run lint
bun run typecheck
bun run typecheck:build
bun run test
bun run test:coverage
bun run build
```

## Versioning

Releases are semver Git tags with assets published to GitHub Releases:

```bash
git tag v0.1.1
git push origin v0.1.1
```

Consumers pin the tag: `bun add github:ynoacamino/microform#v0.1.1`.
