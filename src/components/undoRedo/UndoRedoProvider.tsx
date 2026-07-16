"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type UndoRedoControlador = {
  puedeDeshacer: boolean;
  puedeRehacer: boolean;
  deshacer: () => void;
  rehacer: () => void;
};

type UndoRedoContextValue = {
  controlador: UndoRedoControlador | null;
  registrarControlador: (controlador: UndoRedoControlador | null) => void;
};

const UndoRedoContext = createContext<UndoRedoContextValue | null>(null);

/**
 * Historial de deshacer/rehacer global: vive a nivel de toda la app (junto a Theme/Zoom
 * en layout.tsx) porque los botones y el atajo de teclado están en el Topbar, que es
 * compartido por las 12 sesiones. Cada sesión que maneja su propio historial (como
 * Cotizaciones) se "registra" acá mientras está montada, vía useRegistrarUndoRedo.
 */
export function UndoRedoProvider({ children }: { children: ReactNode }) {
  const [controlador, setControlador] = useState<UndoRedoControlador | null>(null);
  const controladorRef = useRef<UndoRedoControlador | null>(null);

  useEffect(() => {
    controladorRef.current = controlador;
  }, [controlador]);

  useEffect(() => {
    function alPresionarTecla(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey)) return;
      const tecla = e.key.toLowerCase();
      if (tecla === "z" && !e.shiftKey) {
        e.preventDefault();
        controladorRef.current?.deshacer();
      } else if (tecla === "y" || (tecla === "z" && e.shiftKey)) {
        e.preventDefault();
        controladorRef.current?.rehacer();
      }
    }
    window.addEventListener("keydown", alPresionarTecla);
    return () => window.removeEventListener("keydown", alPresionarTecla);
  }, []);

  return (
    <UndoRedoContext.Provider value={{ controlador, registrarControlador: setControlador }}>
      {children}
    </UndoRedoContext.Provider>
  );
}

export function useUndoRedo() {
  const ctx = useContext(UndoRedoContext);
  if (!ctx) throw new Error("useUndoRedo debe usarse dentro de UndoRedoProvider");
  return ctx;
}

/**
 * Una sesión con su propio historial (pasado/futuro) llama esto para que el Topbar sepa
 * que hay un historial activo. Al desmontarse (salir de la sesión) se desregistra solo,
 * así los botones del Topbar quedan deshabilitados fuera de esa sesión.
 */
export function useRegistrarUndoRedo(controlador: UndoRedoControlador | null) {
  const { registrarControlador } = useUndoRedo();

  useEffect(() => {
    registrarControlador(controlador);
    return () => registrarControlador(null);
  }, [controlador, registrarControlador]);
}
