"use client";


import { FilePlus2, Copy, Pencil, Trash2, Search, Filter, Columns3, Settings, type LucideIcon } from "lucide-react";
import styles from "./ModuleRibbon.module.css";

export type RibbonButton = {
  key: string;
  label: string;
  icon: LucideIcon;
  color?: string;
  onClick?: () => void;
};

export type RibbonGroup = {
  key: string;
  label: string;
  buttons: RibbonButton[];
};

export const DEFAULT_GROUPS: RibbonGroup[] = [
  {
    key: "mantenimiento",
    label: "Mantenimiento",
    buttons: [
      { key: "nuevo", label: "Nuevo", icon: FilePlus2, color: "#16a34a" },
      { key: "duplicar", label: "Duplicar", icon: Copy, color: "#f59e0b" },
      { key: "modificar", label: "Modificar", icon: Pencil, color: "var(--eco-azul)" },
      { key: "eliminar", label: "Eliminar", icon: Trash2, color: "#ef4444" },
    ],
  },
  {
    key: "vista",
    label: "Vista",
    buttons: [
      { key: "buscar", label: "Buscar", icon: Search, color: "var(--eco-azul)" },
      { key: "filtro", label: "Filtro", icon: Filter, color: "#8b5cf6" },
      { key: "columnas", label: "Elegir columnas", icon: Columns3, color: "#0d9488" },
    ],
  },
  {
    key: "configuracion",
    label: "Configuración",
    buttons: [{ key: "config", label: "Configuración", icon: Settings, color: "var(--text-secondary)" }],
  },
];

export function ModuleRibbon({ groups = DEFAULT_GROUPS }: { groups?: RibbonGroup[] }) {
  const groupsConAccion = groups
    .map((group) => ({ ...group, buttons: group.buttons.filter((btn) => btn.onClick) }))
    .filter((group) => group.buttons.length > 0);

  return (
    <div className={styles.ribbon}>
      {groupsConAccion.map((group) => (
        <div key={group.key} className={styles.group}>
          <div className={styles.buttons}>
            {group.buttons.map((btn) => (
              <button
                key={btn.key}
                type="button"
                className={styles.button}
                data-active=""
                onClick={btn.onClick}
              >
                <btn.icon size={24} strokeWidth={1.6} style={{ color: "inherit" }} />
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
          <div className={styles.groupLabel}>{group.label}</div>
        </div>
      ))}
    </div>
  );
}
