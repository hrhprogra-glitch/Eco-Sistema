# Eco-Sistema

Sistema de gestión empresarial "todo en uno": un panel único que cubre las áreas
operativas de una empresa (ventas, CRM, facturación, contabilidad, gastos,
inventario, proyectos, empleados, correo, contacto, piscina y configuraciones).
Cada área es un módulo independiente dentro de la misma app.

Es una app de uso **local** (corre en la máquina del usuario, no un SaaS multi-tenant),
pensada para que una empresa reemplace planillas sueltas por un sistema centralizado.

## Stack

- **Next.js 16 (App Router)** + **TypeScript** + **React 19**.
- Estilos con **CSS Modules** (no Tailwind, no styled-components). Nada de clases utilitarias.
- Íconos: **lucide-react** (nunca emojis).
- Base de datos: **PostgreSQL local** (servicio de Windows, no Supabase/nube). Credenciales
  de desarrollo: host `127.0.0.1:5432`, base `eco_sistema`, usuario `harry`. Falta definir
  el ORM/librería de acceso (Prisma o `pg` directo) — no asumir que ya está resuelto.
- Gestor de paquetes: **pnpm**.

## Estructura de carpetas

```
src/
  app/                      # Next.js App Router (rutas, layout raíz, tema global)
    imagenes/               # Assets propios de la app (logo, etc.)
    [slug]/page.tsx         # Ruta dinámica: mapea slug -> módulo de sesión
  components/
    lib/apps.ts             # Lista maestra de las 12 sesiones (slug, nombre, color)
    moduleIcons.tsx         # Mapa slug -> ícono de lucide-react
    db/supabase.ts          # OBSOLETO/en transición: cliente Supabase de una etapa
                             # anterior del proyecto, antes de pasar a Postgres local.
                             # No asumir que sigue siendo la vía de acceso a datos.
    theme/                  # ThemeProvider + ThemeToggle (claro/oscuro global)
    zoom/                   # ZoomProvider + ZoomControl (zoom de página en el topbar)
    Topbar.tsx, ModuleLayout.tsx, EmptyState.tsx   # Chrome compartido entre módulos
    <sesion>/                # una carpeta por cada una de las 12 sesiones
      index.tsx              # "cerebro" del módulo: arma ModuleLayout + su contenido
      types.ts                # tipos de la sesión (Row/Insert/Update al estilo Supabase)
      components/             # componentes propios de esa sesión
```

Cada sesión nueva **debe** seguir ese mismo patrón (`index.tsx` + `types.ts` + `components/`).
No crear páginas de sesión directamente dentro de `src/app`.

## Identidad visual (no negociable)

- El **celeste** (`--eco-celeste`, `#38bdf8`) y el **blanco** (`--eco-blanco`) son la marca:
  tienen que estar presentes siempre, en modo claro y en modo oscuro. Todo lo demás de la
  paleta (grises, colores por módulo, colores de badges) es libre de cambiar.
- Estilo general: **minimalista/corporativo**, inspirado en Odoo. Nada de neumorphism ni
  brutalismo — cansan en un panel de uso diario con tablas y formularios.
- Nunca usar colores planos "a mano" (`#fff`, `rgba(...)` sueltos) en los componentes:
  todo pasa por las variables semánticas definidas en `src/app/globals.css`
  (`--bg-page`, `--bg-surface`, `--text-primary`, `--text-secondary`, `--border-color`,
  `--accent`, `--accent-strong`, `--accent-text`, `--badge-*`). Son las que cambian solas
  entre modo claro/oscuro — un color hardcodeado se rompe en uno de los dos temas.
- Tema y zoom son **globales**: viven en `ThemeProvider`/`ZoomProvider` en
  `src/app/layout.tsx` y afectan a todos los módulos por igual, nunca por sesión.

## Convenciones de UI dentro de un módulo

- Vistas de detalle/edición van **en la misma página** (cambio de vista tipo Odoo,
  con un breadcrumb "← Volver"), **no** como ventana modal flotante. Ver
  `src/components/contacto/components/ContactoDetailView.tsx` como referencia del patrón.
- Mientras un módulo no tenga datos reales, usar `EmptyState` (ícono + texto), no placeholders
  de texto plano ni datos inventados que aparenten estar conectados a algo real.
- Si un módulo usa datos de ejemplo (mock) porque la tabla real todavía no existe, dejarlo
  explícito en el nombre del archivo (`mockContactos.ts`) y avisar al usuario que es temporal.

## Estado conocido / pendiente

- La base de datos local está creada pero **sin tablas todavía** (sin Prisma ni esquema
  definido). No asumir que hay tablas reales salvo que se confirme lo contrario.
- Hay módulos (`inventario`, `empleados`) que se empezaron a conectar directo a
  `@/components/db/supabase` en paralelo a esta conversación; puede haber inconsistencia
  entre módulos que ya "hablan" con una base y otros que siguen en memoria. Verificar el
  estado real del archivo antes de asumir cómo accede a datos cada módulo.
- No hay login/autenticación implementado todavía (el Topbar muestra un usuario fijo
  "Invitado" como placeholder).
