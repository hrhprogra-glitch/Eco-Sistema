"use client";

import type { LucideIcon } from "lucide-react";
import styles from "./ModuleTabs.module.css";

export type ModuleTab<K extends string = string> = { key: K; label: string; icon: LucideIcon };

// Barra de pestañas interna de un módulo (para cambiar de vista sin usar las pestañas
// globales del Topbar) -- misma estética de degradé/glow que Topbar.sectionTab y
// Sidebar.item, para que se sienta parte del mismo sistema aunque viva dentro del módulo.
export function ModuleTabs<K extends string>({
  tabs,
  active,
  onChange,
  ariaLabel,
}: {
  tabs: readonly ModuleTab<K>[];
  active: K;
  onChange: (key: K) => void;
  ariaLabel: string;
}) {
  return (
    <nav className={styles.tabs} aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            className={styles.tab}
            data-active={active === tab.key ? "" : undefined}
            onClick={() => onChange(tab.key)}
          >
            <Icon size={14} className={styles.tabIcon} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
