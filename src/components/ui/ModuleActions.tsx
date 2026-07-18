"use client";

import type { LucideIcon } from "lucide-react";
import styles from "./ModuleActions.module.css";

export type ModuleAction = {
  key: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  /** "primary" resalta la acción principal de la sesión (ej. "Nuevo…"). */
  tone?: "primary" | "danger";
  /** Resalta el botón como la opción actualmente seleccionada (ej. switch de vista). */
  active?: boolean;
};

/**
 * Fila de botones de acción de una sesión: solo se muestran las acciones que
 * esa sesión realmente puede ejecutar (nada de herramientas deshabilitadas
 * de relleno). Si no hay ninguna, no se renderiza nada.
 *
 * variant "inline": solo la fila de botones, sin marco propio, para cuando
 * va dentro de un contenedor que ya tiene el suyo (ej. el formulario
 * flotante). variant "sidebar": botones apilados a todo el ancho, para ir
 * dentro de una FilterSection del panel de filtro o del panel de ActionsDrawer.
 */
export function ModuleActions({ actions, variant }: { actions: ModuleAction[]; variant: "inline" | "sidebar" }) {
  if (actions.length === 0) return null;

  const variantClass = variant === "inline" ? styles.actionsInline : styles.actionsSidebar;

  return (
    <div className={variantClass}>
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          className={styles.button}
          data-tone={action.tone}
          data-active={action.active ? "" : undefined}
          disabled={action.disabled}
          onClick={action.onClick}
        >
          <action.icon size={16} strokeWidth={2} />
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}
