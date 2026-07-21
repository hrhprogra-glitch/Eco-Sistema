"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const COLLAPSED_KEY = "eco-sidebar-collapsed";
const POSITION_KEY = "eco-sidebar-position";
const CHANGE_EVENT = "eco-sidebar-change";

export type SidebarPosition = "left" | "right";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getCollapsedSnapshot(): boolean {
  return window.localStorage.getItem(COLLAPSED_KEY) === "1";
}

function getCollapsedServerSnapshot(): boolean {
  return false;
}

function getPositionSnapshot(): SidebarPosition {
  return window.localStorage.getItem(POSITION_KEY) === "right" ? "right" : "left";
}

function getPositionServerSnapshot(): SidebarPosition {
  return "left";
}

const SidebarContext = createContext<{
  collapsed: boolean;
  toggle: () => void;
  position: SidebarPosition;
  setPosition: (position: SidebarPosition) => void;
} | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const collapsed = useSyncExternalStore(subscribe, getCollapsedSnapshot, getCollapsedServerSnapshot);
  const position = useSyncExternalStore(subscribe, getPositionSnapshot, getPositionServerSnapshot);

  const toggle = useCallback(() => {
    window.localStorage.setItem(COLLAPSED_KEY, collapsed ? "0" : "1");
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, [collapsed]);

  const setPosition = useCallback((next: SidebarPosition) => {
    window.localStorage.setItem(POSITION_KEY, next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  // Ctrl+A (Cmd+A en Mac) despliega/colapsa el menú principal sin tocar el mouse -- el
  // estado ya queda guardado solo (ver COLLAPSED_KEY arriba). Se frena el atajo nativo
  // solo cuando el foco NO está en un campo de texto: adentro de un input/textarea
  // Ctrl+A tiene que seguir seleccionando todo el texto como siempre, si no se rompería
  // el atajo de edición más común de toda la app.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "a") return;
      const activo = document.activeElement;
      const isInput = activo instanceof HTMLInputElement;
      const isTextArea = activo instanceof HTMLTextAreaElement;
      const isContentEditable = activo instanceof HTMLElement && activo.isContentEditable;
      
      const enCampoDeTexto = isInput || isTextArea || isContentEditable;
      
      // Si está en un campo de texto pero está vacío, permitimos el atajo
      // porque "seleccionar todo" no tiene sentido en un campo sin texto.
      // Esto arregla el problema en módulos como Salidas donde el buscador tiene autoFocus.
      let tieneTexto = false;
      if (isInput) tieneTexto = (activo as HTMLInputElement).value.length > 0;
      if (isTextArea) tieneTexto = (activo as HTMLTextAreaElement).value.length > 0;
      if (isContentEditable) tieneTexto = (activo as HTMLElement).textContent?.length ? (activo as HTMLElement).textContent!.length > 0 : false;

      if (enCampoDeTexto && tieneTexto) return;
      event.preventDefault();
      toggle();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, position, setPosition }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return ctx;
}
