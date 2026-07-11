"use client";

import { Settings, Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ZoomControl } from "@/components/zoom/ZoomControl";
import { SyncStatus } from "@/components/sync/SyncStatus";
import { FloatingWindow } from "@/components/ui/FloatingWindow";
import { useSidebar } from "@/components/sidebar/SidebarProvider";
import styles from "./SettingsMenu.module.css";

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { position, setPosition } = useSidebar();

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={styles.trigger}
        aria-label="Configuración"
        title="Configuración"
      >
        <Settings size={18} />
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.row}>
            <span className={styles.label}>Tema</span>
            <ThemeToggle />
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Zoom</span>
            <ZoomControl />
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Sincronización</span>
            <SyncStatus />
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Posición del sidebar</span>
            <div className={styles.segmented}>
              <button
                type="button"
                onClick={() => setPosition("left")}
                data-active={position === "left" ? "" : undefined}
              >
                Izquierda
              </button>
              <button
                type="button"
                onClick={() => setPosition("right")}
                data-active={position === "right" ? "" : undefined}
              >
                Derecha
              </button>
            </div>
          </div>

          <button
            type="button"
            className={styles.advancedButton}
            onClick={() => {
              setAdvancedOpen(true);
              setOpen(false);
            }}
          >
            <Settings2 size={15} />
            Configuraciones avanzadas
          </button>
        </div>
      )}

      {advancedOpen && (
        <FloatingWindow title="Configuraciones avanzadas" onClose={() => setAdvancedOpen(false)}>
          <p className={styles.advancedEmpty}>Todavía no hay opciones avanzadas configuradas acá.</p>
        </FloatingWindow>
      )}
    </div>
  );
}
