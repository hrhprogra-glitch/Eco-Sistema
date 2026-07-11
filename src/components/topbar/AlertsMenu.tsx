"use client";

import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./AlertsMenu.module.css";

export function AlertsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        aria-label="Alertas"
        title="Alertas"
      >
        <Bell size={18} />
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.title}>Alertas</div>
          <p className={styles.empty}>No hay notificaciones.</p>
        </div>
      )}
    </div>
  );
}
