"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "eco-zoom";
const CHANGE_EVENT = "eco-zoom-change";
const MIN = 90;
const MAX = 150;
const STEP = 10;
const DEFAULT = 100;

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getSnapshot(): number {
  const stored = Number(window.localStorage.getItem(STORAGE_KEY));
  return stored >= MIN && stored <= MAX ? stored : DEFAULT;
}

function getServerSnapshot(): number {
  return DEFAULT;
}

const ZoomContext = createContext<{
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
} | null>(null);

export function ZoomProvider({ children }: { children: ReactNode }) {
  const zoom = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.style.setProperty("zoom", `${zoom}%`);
  }, [zoom]);

  const setZoom = useCallback((next: number) => {
    const clamped = Math.min(MAX, Math.max(MIN, next));
    window.localStorage.setItem(STORAGE_KEY, String(clamped));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const zoomIn = useCallback(() => setZoom(getSnapshot() + STEP), [setZoom]);
  const zoomOut = useCallback(() => setZoom(getSnapshot() - STEP), [setZoom]);
  const resetZoom = useCallback(() => setZoom(DEFAULT), [setZoom]);

  return (
    <ZoomContext.Provider value={{ zoom, zoomIn, zoomOut, resetZoom }}>
      {children}
    </ZoomContext.Provider>
  );
}

export function useZoom() {
  const ctx = useContext(ZoomContext);
  if (!ctx) {
    throw new Error("useZoom must be used within ZoomProvider");
  }
  return ctx;
}
