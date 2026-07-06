---
name: revisar-tema
description: Audits eco-sistema's CSS Modules for hardcoded colors (hex or rgba literals) that bypass the shared theme tokens in src/app/globals.css and would look broken or illegible when switching between light and dark mode. Use this whenever the user asks to check/fix dark mode, light mode, contraste, "que se note bien en oscuro", "revisa el tema", or right after adding new components/styles to eco-sistema — new CSS very easily reintroduces a hardcoded color that silently breaks in one of the two themes.
---

# Revisar tema (claro/oscuro) en eco-sistema

El tema de toda la app se controla con el atributo `data-theme` en `<html>`
(ver `src/components/theme/ThemeProvider.tsx`), que activa un bloque distinto
de variables CSS en `src/app/globals.css`. Cualquier color escrito "a mano"
en un `.module.css` (en vez de una `var(--algo)`) queda fijo en los dos temas,
y eso es exactamente lo que suele romper la legibilidad al pasar a oscuro
(texto azul oscuro sobre fondo azul oscuro, por ejemplo).

Este skill es una auditoría de lectura, no un fix automático: reportá lo que
encontrás y esperá confirmación antes de tocar el CSS, salvo que el usuario ya
haya pedido explícitamente que lo corrijas de una.

## Tokens disponibles (para no tener que redescubrirlos)

De `src/app/globals.css`, con valores distintos en `:root` (claro) y
`:root[data-theme="dark"]` (oscuro) — el celeste y el uso del blanco son la
única marca que se mantiene fija en ambos:

- `--bg-page`, `--bg-surface`, `--bg-surface-glass`, `--bg-sidebar` → fondos.
- `--text-primary`, `--text-secondary` → texto.
- `--border-color`, `--border-glass` → bordes.
- `--shadow-card`, `--shadow-card-hover` → sombras.
- `--accent` (celeste, fijo), `--accent-strong` (azul, fijo), `--accent-contrast`
  (texto sobre fondo `--accent`), `--accent-text` (texto de color sobre el fondo
  de página — azul en claro, celeste en oscuro; usalo para links, tabs activos,
  íconos de acento, NUNCA `--accent-strong` para texto plano, porque el azul
  fijo pierde contraste sobre fondos oscuros).
- `--badge-cliente-bg` / `--badge-cliente-text`, `--badge-proveedor-bg` /
  `--badge-proveedor-text`, `--badge-otro-bg` / `--badge-otro-text` → chips de
  clasificación con su propio par fondo/texto por tema.

## Cómo auditar

1. Buscá literales de color fuera de `globals.css` (ahí sí van, son las
   definiciones):

   ```
   grep -rnE "#[0-9a-fA-F]{3,8}|rgba?\(" src --include="*.module.css" \
     | grep -v "src/app/globals.css"
   ```

2. Para cada resultado, mirá el selector y la propiedad (`color`, `background`,
   `border-color`, `box-shadow`) y preguntate qué representa:
   - ¿Es texto sobre el fondo de página/superficie? → probablemente
     `--text-primary` o `--text-secondary`, o `--accent-text` si es un link/
     acento de color.
   - ¿Es un fondo de tarjeta/panel? → `--bg-surface` o `--bg-page`.
   - ¿Es un borde sutil? → `--border-color`.
   - ¿Es un chip de estado (tipo cliente/proveedor/otro)? → el par
     `--badge-*-bg`/`--badge-*-text` que corresponda, o agregar uno nuevo si
     es una categoría distinta.

3. **Excepciones legítimas que NO hay que reportar como bug**: colores fijos
   sobre superficies que ya son de color garantizado en ambos temas — por
   ejemplo `color: #fff` en el ícono dentro de un tile que tiene
   `background: app.color` (ver `.iconTile` en `src/app/page.module.css`):
   ese blanco siempre va a estar sobre un fondo de color saturado, así que es
   correcto que sea fijo. Si tenés dudas de si algo es una excepción real o un
   bug, fijate si el fondo detrás de ese texto/ícono cambia con el tema — si no
   cambia, el color fijo es válido.

## Reportar

Para cada hallazgo real (no las excepciones), indicá:

- Archivo y línea.
- El valor hardcodeado encontrado.
- Con qué variable semántica debería reemplazarse, y por qué (qué rol cumple
  ese color: texto, fondo, borde, etc.).

No apliques los reemplazos vos mismo salvo que el usuario te lo pida
explícitamente después de ver el reporte.
