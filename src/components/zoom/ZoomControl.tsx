"use client";

import { Minus, Plus } from "lucide-react";
import { useZoom } from "./ZoomProvider";
import styles from "./ZoomControl.module.css";

export function ZoomControl() {
  const { zoom, zoomIn, zoomOut, resetZoom } = useZoom();

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        onClick={zoomOut}
        className={styles.button}
        aria-label="Reducir zoom"
        title="Reducir zoom"
      >
        <Minus size={14} />
      </button>
      <button
        type="button"
        onClick={resetZoom}
        className={styles.level}
        title="Restablecer zoom al 100%"
      >
        {zoom}%
      </button>
      <button
        type="button"
        onClick={zoomIn}
        className={styles.button}
        aria-label="Aumentar zoom"
        title="Aumentar zoom"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
