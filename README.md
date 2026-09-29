# microform

Headless form/field engine — solo lógica, cero estilos.

Tipos + registry por instancia + defaults Zod + limpieza de variables +
extracción de items + adapters inyectables (`Storage`, `Notify`).
El usuario inyecta sus componentes con el estilo que quiera
(shadcn, MUI, Tailwind, React Native) y registra `customFields`
sin tocar el core.

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
  cleanVariables,
  createEnumOptions,
  createFormDefaults,
  createRegistry,
} from "microform";

const schema = z.object({ name: z.string(), nickname: z.string().optional() });
const defaults = createFormDefaults(schema); // { name: "", nickname: undefined }
const required = buildRequiredMap(schema); // name → true, nickname → false

const LABELS = { DNI: "DNI", CE: "Carné de extranjería" } as const;
const options = createEnumOptions<keyof typeof LABELS>(LABELS);

const registry = createRegistry();
registry.register("text", (ctx) => ({ ...ctx, painted: "by-user-ui" }));
registry.register("color", (ctx) => ({ ...ctx, custom: true })); // customField

const vars = cleanVariables({ search: "  ", take: 50 }); // { take: 50 }
```

## Scripts

```bash
bun install
bun run lint
bun run typecheck
bun run test
bun run build
```

## Versionado

```bash
# tags semver para fijar versiones desde git:
# v0.1.0, v0.1.1, ... 1.0.0 al migrar frontend
```
