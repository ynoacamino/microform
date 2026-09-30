# microform

Headless form/field engine — solo lógica, cero estilos.

`core/` (tipos + registry, sin react/zod/fetch) → `schema/` (zod: defaults
de creación + edición) → `react/` (binding oficial RHF: Provider, Controller,
Grid, hooks) → adapter de la app (shadcn + urql + sonner + storage).
`data/` porta lo transversal: `Storage`/`Notify`/`MutationPort`/`QuerySource`,
`cleanVars`, `submit`, persistencia y `async-source` Promise-based.

> Extraído de `school-assistance/apps/frontend|pwa/src/libs/{forms,fields}`.
> Ver `PLAN_MICROFORM.md` para el roadmap completo.

## Instalación (GitHub, sin npm)

```bash
bun add github:ynoacamino/microform zod
# o versión/tag concreto:
# bun add github:ynoacamino/microform#v0.1.0 zod
```

> El paquete se consume desde `src/` directo (`exports: ./src/index.ts`).
> No hay build ni `dist` en el repo. Las dependencias internas (`zod` como peer)
> se resuelven desde npm con normalidad aunque el paquete viva en GitHub.

## Uso

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
const defaults = createFormDefaults(schema); // { name: "", nickname: undefined }
const required = buildRequiredMap(schema); // name → true, nickname → false

const LABELS = { DNI: "DNI", CE: "Carné de extranjería" } as const;
const options = createEnumOptions<keyof typeof LABELS>(LABELS);

const microform = createMicroform({
  controls: [defineControl({ type: "text", renderer: (ctx) => ({ ...ctx }) })],
});
microform.register("color", (ctx) => ({ ...ctx, custom: true })); // customField

const vars = cleanVars({ search: "  ", take: 50 }); // { take: 50 } (omit)
const mutationVars = cleanVars({ nick: "" }, { empty: "null" }); // { nick: null }
```

```tsx
import { MicroformProvider, StructForm, useAsyncQuery } from "microform/react";
// El adapter registra renderers shadcn por cada tipo de BUILT_IN_TYPES
// y adapta urql → QuerySource (ver docs/adapters/urql.md).
```

## Arquitectura

```text
src/
  index.ts        # core+schema+data+catalog+adapters (jamás react)
  react.ts        # binding oficial RHF (requerido)
  core/           # control, field, structure, infer, registry, define-control
  schema/         # zod-defaults (creación), edit-defaults (edición genérica)
  data/           # ports, clean, extract-items, async-source, submit, persistence
  catalog/        # configs, options, enum-options (tipos, sin renderers)
  react/          # provider, infer-field, form-fields, struct-form, field-grid,
                  # use-async-query, use-persistence
  adapters/       # memory-storage (el resto lo pone la app)
docs/adapters/urql.md  # ejemplo: urql → QuerySource/MutationPort (fuera del core)
```

Reglas: `core/` no importa react, zod, DOM ni fetch. `schema/` es el único
lugar con zod. `data/` el único con puertos reales. `react/` delgado, sin
estilos. Transporte (urql/GraphQL) solo en el adapter de la app.

## Scripts

```bash
bun install
bun run lint
bun run typecheck
bun run typecheck:build
bun run test
bun run build
```

## Versionado

```bash
# tags semver para fijar versiones desde git:
# v0.1.0, v0.1.1, ... 1.0.0 al migrar frontend
```
