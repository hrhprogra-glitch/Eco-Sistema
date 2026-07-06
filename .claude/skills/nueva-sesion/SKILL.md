---
name: nueva-sesion
description: Scaffolds a brand-new business module ("sesión") for the eco-sistema Next.js app, wiring it into apps.ts, moduleIcons.tsx and the [slug] router. Use this any time the user asks to add a new session/módulo/área/apartado to eco-sistema (e.g. "agrega una sesión de mantenimiento", "necesito un módulo nuevo para X", "quiero sumar Z al panel", "crea una sección de Y") — don't hand-roll the folder structure from scratch or improvise a different pattern, this skill encodes the exact structure every one of the 12 existing sessions already follows.
---

# Nueva sesión de eco-sistema

Cada módulo del panel (ventas, crm, facturacion, contabilidad, gastos, inventario,
proyectos, empleados, correo, contacto, piscina, configuraciones) sigue exactamente
el mismo esqueleto. La razón de tener este skill es que ese patrón tiene piezas en
cuatro archivos distintos que hay que tocar en el orden correcto — es fácil olvidarse
de una y terminar con un módulo que no aparece en el home o que rompe el build.

## Antes de escribir nada, reuní estos datos

Si el usuario no los dio todos, preguntá lo que falte (no inventes un slug o color
al azar sin decirlo):

1. **slug**: minúsculas, sin espacios ni acentos (ej. `mantenimiento`).
2. **name**: nombre para mostrar (ej. "Mantenimiento").
3. **description**: una oración corta, mismo tono que las existentes en
   `src/components/lib/apps.ts` (mirá los ejemplos ahí antes de escribir la tuya).
4. **color**: un hex que no se repita con los colores ya usados en `apps.ts`.
5. **entity**: nombre en PascalCase de la entidad principal que va a manejar ese
   módulo (ej. `Vehiculo`, `Turno`) — se usa para el tipo en `types.ts`.
6. Un ícono de `lucide-react` que represente bien el dominio (ver paso 3).

## Pasos

### 1. Crear la carpeta del módulo

`src/components/<slug>/`:

**`index.tsx`** — el "cerebro" del módulo. Sigue siempre esta forma:

```tsx
import { ModuleLayout } from "@/components/ModuleLayout";
import { getApp } from "@/components/lib/apps";
import { <Entity>Placeholder } from "./components/<Entity>Placeholder";

const app = getApp("<slug>")!;

export default function <Pascal>Module() {
  return (
    <ModuleLayout app={app}>
      <<Entity>Placeholder />
    </ModuleLayout>
  );
}
```

(`<Pascal>` es el slug en PascalCase, ej. `mantenimiento` → `Mantenimiento`.)

**`types.ts`** — tipos al estilo Supabase Row/Insert/Update, para que cuando se
conecte la base de datos real ya haya un contrato claro:

```ts
export type <Entity> = {
  id: string;
  // agregá acá 2-4 campos relevantes al dominio, con su tipo
  created_at: string;
};

export type <Pascal>Tables = {
  <tabla_snake_case>: {
    Row: <Entity>;
    Insert: Omit<<Entity>, "id" | "created_at"> & Partial<Pick<<Entity>, "id" | "created_at">>;
    Update: Partial<<Entity>>;
  };
};
```

**`components/<Entity>Placeholder.tsx`** — hasta que el módulo tenga funcionalidad
real, usa el `EmptyState` compartido (no texto plano suelto, no datos inventados
que aparenten estar conectados a algo real):

```tsx
import { EmptyState } from "@/components/EmptyState";
import { moduleIcons } from "@/components/moduleIcons";

export function <Entity>Placeholder() {
  return (
    <EmptyState
      icon={moduleIcons["<slug>"]}
      title="Este módulo está en construcción"
      description="Muy pronto vas a poder gestionar todo desde acá."
    />
  );
}
```

### 2. Registrar la sesión en `src/components/lib/apps.ts`

Agregá un objeto al array `apps` con `slug`, `name`, `description`, `color`,
respetando el orden y formato de los que ya existen. No toques el campo `icon`:
ese arreglo ya no lo tiene (los íconos viven en `moduleIcons.tsx`, separados de
los datos).

### 3. Agregar el ícono en `src/components/moduleIcons.tsx`

Elegí un ícono de `lucide-react` que tenga sentido semántico para el dominio
(mirá los que ya están mapeados ahí para el criterio: Ventas → TrendingUp,
Piscina → Waves, Configuraciones → Settings, etc.). Importalo y agregá la
entrada `<slug>: <Icono>` al objeto `moduleIcons`.

### 4. Registrar el componente en `src/app/[slug]/page.tsx`

Ese archivo tiene un import por cada módulo y un diccionario `moduleComponents`
que mapea slug → componente. Agregá el import de tu nuevo `index.tsx` y una
entrada más en el diccionario. Sin este paso el módulo existe pero la ruta
`/tu-slug` da 404.

## Verificar al final

Corré estos dos comandos y arreglá cualquier error antes de darlo por terminado:

```
npx tsc --noEmit -p tsconfig.json
npx eslint .
```

## Qué NO hacer

- No crees páginas de sesión directo en `src/app/` — todo el contenido de negocio
  vive en `src/components/<slug>/`, `src/app` es solo ruteo.
- No hardcodees colores (`#fff`, `rgba(...)` sueltos) si el módulo lleva CSS propio:
  usá las variables de `src/app/globals.css` (`--bg-page`, `--bg-surface`,
  `--text-primary`, `--text-secondary`, `--accent`, etc.) para que el modo oscuro
  funcione solo. Si tenés dudas de qué token usar, corré el skill `revisar-tema`.
