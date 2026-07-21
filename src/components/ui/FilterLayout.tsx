"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./FilterLayout.module.css";
import { Filter, ChevronRight, ChevronLeft, Search } from "lucide-react";
import { useSidebar } from "@/components/sidebar/SidebarProvider";

type FilterLayoutProps = {
  children: React.ReactNode;
  sidebarContent: React.ReactNode;
  onLetterSelect?: (letter: string) => void;
  selectedLetter?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  // El índice A-Z solo tiene sentido al lado de una tabla que se pueda filtrar por
  // inicial: en sesiones sin tabla (ej. un formulario de detalle) no cumple ninguna
  // función y solo ocupa espacio, así que cada sesión puede apagarlo.
  showAlphabetIndex?: boolean;
  errorBanner?: React.ReactNode;
};

const ALPHABET = [
  "0-9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "ñ", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
];

// El primer botón del índice ya no es un atajo por inicial numérica: es un indicador
// de que la tabla pagina de a 50 registros (ver DataTable.DEFAULT_PAGE_SIZE). El valor
// interno sigue siendo "0-9" para no tocar los filtros por letra de cada módulo.
const ALPHABET_LABELS: Record<string, string> = { "0-9": "0-50" };

const SIDEBAR_VISIBLE_KEY = "eco-sidebar-visible";

export function FilterLayout({
  children,
  sidebarContent,
  onLetterSelect,
  selectedLetter = "0-9",
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar…",
  showAlphabetIndex = true,
  errorBanner,
}: FilterLayoutProps) {
  // El panel recuerda si estaba abierto o cerrado la última vez -antes arrancaba siempre
  // cerrado al entrar a cualquier sesión- guardado en localStorage y compartido por todos
  // los módulos que usan este mismo panel.
  const [isSidebarVisible, setIsSidebarVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_VISIBLE_KEY) === "1";
  });

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_VISIBLE_KEY, isSidebarVisible ? "1" : "0");
  }, [isSidebarVisible]);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  function toggleSidebarVisible() {
    setIsSidebarVisible((prev) => !prev);
  }

  // Clic afuera del panel (y afuera del botón que lo abre, para no reabrirlo en el mismo
  // gesto) lo cierra — igual que cualquier panel flotante estándar.
  useEffect(() => {
    if (!isSidebarVisible) return;
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (sidebarRef.current?.contains(target)) return;
      if (toggleRef.current?.contains(target)) return;
      setIsSidebarVisible(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isSidebarVisible]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        toggleSidebarVisible();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Navegación por teclado dentro del panel (cuando está abierto)
  useEffect(() => {
    if (!isSidebarVisible) return;

    // Al abrir, enfocar el primer elemento interactivo
    setTimeout(() => {
      const focusable = sidebarRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      }
    }, 10);

    function handlePanelKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsSidebarVisible(false);
        return;
      }
      
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const nodes = sidebarRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!nodes || nodes.length === 0) return;
        
        const focusableElements = Array.from(nodes);
        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
        
        e.preventDefault(); // prevenir scroll
        
        if (e.key === "ArrowDown") {
          const nextIndex = (currentIndex + 1) % focusableElements.length;
          focusableElements[nextIndex].focus();
        } else {
          const nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
          focusableElements[nextIndex].focus();
        }
      }
    }

    document.addEventListener("keydown", handlePanelKeyDown);
    return () => document.removeEventListener("keydown", handlePanelKeyDown);
  }, [isSidebarVisible]);

  const { position: navPosition } = useSidebar();
  // El panel de filtros va siempre del lado opuesto al menú principal.
  const filterSide: "left" | "right" = navPosition === "right" ? "left" : "right";

  // El botón que abre el panel queda fijo en su columna, pegado al costado del
  // índice alfabético (0-50/a-z) — igual que al principio. Lo único que cambia
  // es el panel en sí: flota ENCIMA de la tabla (position absoluta dentro de
  // .mainContent) en vez de compartir espacio en el layout, así abrirlo/cerrarlo
  // nunca mueve ni achica la tabla.
  const sidebarEl = (
    <div className={styles.sidebar}>
      {onSearchChange && (
        <div className={styles.searchBox}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={searchPlaceholder}
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
      {sidebarContent}
    </div>
  );

  const mainContentEl = (
    <div className={styles.mainContent}>
      {errorBanner}
      {children}
      {isSidebarVisible && (
        <div ref={sidebarRef} className={styles.sidebarOverlay} data-side={filterSide}>
          {sidebarEl}
        </div>
      )}
    </div>
  );

  const alphabetEl = (
    <div className={styles.alphabetIndex}>
      {ALPHABET.map((letter) => (
        <div
          key={letter}
          className={styles.letter}
          data-active={selectedLetter === letter ? "" : undefined}
          data-wide={ALPHABET_LABELS[letter] ? "" : undefined}
          onClick={() => onLetterSelect?.(letter)}
        >
          {ALPHABET_LABELS[letter] ?? letter}
        </div>
      ))}
    </div>
  );

  const CollapseIcon = filterSide === "right" ? ChevronRight : ChevronLeft;

  const toggleEl = (
    <button
      ref={toggleRef}
      type="button"
      onClick={toggleSidebarVisible}
      className={styles.toggleWrap}
      data-side={filterSide}
      data-open={isSidebarVisible ? "" : undefined}
      title={isSidebarVisible ? "Ocultar filtros y acciones" : "Mostrar filtros y acciones"}
    >
      {isSidebarVisible ? <CollapseIcon size={15} /> : <Filter size={15} />}
    </button>
  );

  return (
    <div className={styles.container}>
      {filterSide === "right" ? (
        <>
          {mainContentEl}
          {showAlphabetIndex && alphabetEl}
          {toggleEl}
        </>
      ) : (
        <>
          {toggleEl}
          {showAlphabetIndex && alphabetEl}
          {mainContentEl}
        </>
      )}
    </div>
  );
}

// Utility components for the sidebar content
export function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.filterSection}>
      <div className={styles.sectionTitle}>{title}</div>
      <div className={styles.sectionContent}>
        {children}
      </div>
    </div>
  );
}
