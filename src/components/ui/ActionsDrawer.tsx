"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { ModuleActions, type ModuleAction } from "./ModuleActions";
import styles from "./ActionsDrawer.module.css";

/**
 * Reemplazo de la franja fija de botones arriba de una sesión: un botón chico
 * siempre visible que despliega un panel con las acciones, flotando encima
 * del contenido (sin empujarlo ni reacomodarlo), igual que el panel de
 * filtros pero superpuesto en vez de correr la página al costado.
 */
export function ActionsDrawer({ actions }: { actions: ModuleAction[] }) {
  const [open, setOpen] = useState(false);

  if (actions.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen((prev) => !prev)}
        title={open ? "Ocultar acciones" : "Mostrar acciones"}
      >
        {open ? <X size={16} /> : <SlidersHorizontal size={16} />}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelTitle}>Acciones</div>
          <div className={styles.panelContent}>
            <ModuleActions actions={actions} variant="sidebar" />
          </div>
        </div>
      )}
    </div>
  );
}
