---
name: nueva-sesion
description: Scaffolds a brand-new business module ("sesión") for the eco-sistema Next.js app, wiring it into apps.ts and GroupPage.tsx. Use this any time the user asks to add a new session/módulo/área/apartado to eco-sistema (e.g. "agrega una sesión de mantenimiento", "necesito un módulo nuevo para X", "quiero sumar Z al panel", "crea una sección de Y") — don't hand-roll the folder structure from scratch or improvise a different pattern, this skill encodes the exact structure every existing session already follows.
---

# Nueva sesión de eco-sistema

Cada módulo del panel (crm, facturacion, contabilidad, gastos, inventario, proyectos,
empleados, correo, contacto, piscina, configuraciones, etc.) sigue exactamente el mismo
esqueleto. La razón de tener este skill es que ese patrón tiene piezas en dos archivos
distintos que hay que tocar en el orden correcto — es fácil olvidarse de una y terminar
con un módulo que no aparece en el panel o que rompe el build.

## Antes de escribir nada, reuní estos datos

Si el usuario no los dio todos, preguntá lo que falte (no inventes un slug, grupo o
ícono al azar sin decirlo):

1. **slug**: minúsculas, sin espacios ni acentos (ej. `mantenimiento`).
2. **name**: nombre para mostrar (ej. "Mantenimiento").
3. **grupo**: a qué `ModuleGroup` de `src/components/lib/apps.ts` pertenece la sesión
   nueva (Comercial, Inventario, Finanzas, Administración, RRHH, Piscina, etc.). Una
   sesión nueva casi siempre es un `Section` más dentro de un grupo existente, no un
   grupo nuevo — confirmá con el usuario si en realidad quiere un grupo nuevo.
4. **entity**: nombre en PascalCase de la entidad principal que va a manejar ese
   módulo (ej. `Vehiculo`, `Turno`) — se usa para el tipo en `types.ts`.
5. Un ícono de `lucide-react` que represente bien el dominio y no se repita con los
   que ya están importados en `apps.ts`.

## Pasos

### 1. Crear la carpeta del módulo

`src/components/<slug>/`:

**`index.tsx`** — el "cerebro" del módulo. Hasta que el módulo tenga funcionalidad
real, es solo un `EmptyState` (no texto plano suelto, no datos inventados que
aparenten estar conectados a algo real, y **nunca** una barra de herramientas con
botones deshabilitados de relleno — ver la sección "Cuando el módulo pase a tener
datos reales" más abajo para lo que corresponde una vez que sí hay algo funcional):

```tsx
import { <Icono> } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function <Pascal>Module() {
  return (
    <EmptyState
      icon={<Icono>}
      title="<Name>"
      description="Este módulo está en blanco, listo para empezar a construirlo."
    />
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

### 2. Registrar la sección en `src/components/lib/apps.ts`

Buscá el `ModuleGroup` correspondiente dentro de `appGroups` y agregá un objeto más
a su array `sections`:

```ts
{ slug: "<slug>", name: "<Name>", icon: <Icono>, implemented: true },
```

Importá el ícono de `lucide-react` arriba del archivo junto con los demás. No hay un
`moduleIcons.tsx` separado ni un `getApp()`: el ícono vive directo en el objeto
`Section`, y la única función exportada para leer esto es `getGroup(slug)`.

### 3. Registrar el componente en `src/components/GroupPage.tsx`

Ese archivo tiene un import por cada módulo arriba y un diccionario
`sectionComponents` que mapea slug → componente. Agregá el import de tu nuevo
`index.tsx` y una entrada más en el diccionario, con el mismo slug que usaste en
`apps.ts`. Sin este paso la sección aparece en el menú pero al entrar muestra
"Disponible próximamente" en vez de tu módulo.

## Cuando el módulo pase a tener datos reales

Este skill scaffoldea el módulo **vacío**. Cuando más adelante se conecte a datos
reales (tabla + API + CRUD), la sesión tiene que seguir el mismo patrón que ya usan
Contacto, CRM, Cotizaciones y Facturación — no inventes un layout nuevo:

- **Si el módulo muestra una lista/tabla de registros** (con búsqueda, filtros por
  estado, etc.): usá `FilterLayout` + `FilterSection` de `@/components/ui/FilterLayout`.
  El panel arranca **cerrado** por defecto (no lo fuerces a abierto). Adentro, la
  primera `FilterSection` se llama "Acciones" y contiene
  `<ModuleActions actions={...} variant="sidebar" />` (de `@/components/ui/ModuleActions`)
  con los botones reales del módulo (ej. "Nuevo <entidad>"). Las demás secciones son
  los filtros reales que apliquen (Estados, Recientes, etc.) — nunca criterios
  inventados sin datos detrás.
- **Si el módulo NO es una lista navegable** (un formulario de documento a página
  completa, una grilla tipo calendario, etc.): usá `ActionsDrawer` de
  `@/components/ui/ActionsDrawer` en vez de `FilterLayout`. Es un botón chico fijo
  arriba a la derecha que despliega un panel con las mismas acciones, **flotando
  encima** del contenido sin empujarlo ni reacomodarlo (mirá `CotizacionForm.tsx`,
  `FacturaForm.tsx` o `calendario/index.tsx` como referencia).
- En ambos casos, el contenedor raíz del módulo lleva
  `style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}`
  (agregá `position: "relative"` si usás `ActionsDrawer`, porque su panel se posiciona
  `absolute` respecto de ese contenedor).
- `ModuleAction` (el tipo de cada botón) es `{ key, label, icon, onClick, disabled?,
  tone?: "primary" | "danger" }`. Usá `tone: "primary"` para la acción principal (la
  de crear) y `tone: "danger"` para eliminar. No agregues botones sin `onClick` real
  ("de relleno"): si la acción todavía no está implementada, no lo pongas.

## Verificar al final

Corré esto y arreglá cualquier error antes de darlo por terminado:

```
npx tsc --noEmit
```

## Qué NO hacer

- No crees páginas de sesión directo en `src/app/` — todo el contenido de negocio
  vive en `src/components/<slug>/`, `src/app` es solo ruteo.
- No hardcodees colores (`#fff`, `rgba(...)` sueltos) si el módulo lleva CSS propio:
  usá las variables de `src/app/globals.css` (`--bg-page`, `--bg-surface`,
  `--text-primary`, `--text-secondary`, `--accent`, `--ribbon-bg`, etc.) para que el
  modo oscuro funcione solo. Si tenés dudas de qué token usar, corré el skill
  `revisar-tema`.
- No reintroduzcas una barra de herramientas fija arriba con botones deshabilitados
  de relleno (el patrón viejo "ModuleRibbon") — ese componente ya no existe en el
  proyecto a propósito.
