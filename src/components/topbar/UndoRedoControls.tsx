"use client";

import { Undo2, Redo2 } from "lucide-react";
import { useUndoRedo } from "@/components/undoRedo/UndoRedoProvider";
import styles from "./UndoRedoControls.module.css";

export function UndoRedoControls() {
  const { controlador } = useUndoRedo();

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.button}
        disabled={!controlador?.puedeDeshacer}
        onClick={() => controlador?.deshacer()}
        aria-label="Deshacer"
        title="Deshacer (Ctrl+Z)"
      >
        <Undo2 size={18} />
      </button>
      <button
        type="button"
        className={styles.button}
        disabled={!controlador?.puedeRehacer}
        onClick={() => controlador?.rehacer()}
        aria-label="Rehacer"
        title="Rehacer (Ctrl+Y)"
      >
        <Redo2 size={18} />
      </button>
    </div>
  );
}
