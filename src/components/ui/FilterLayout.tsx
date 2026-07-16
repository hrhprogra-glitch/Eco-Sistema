"use client";

import React, { useState } from "react";
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
};

const ALPHABET = [
  "0-9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "ñ", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
];

// El primer botón del índice ya no es un atajo por inicial numérica: es un indicador
// de que la tabla pagina de a 50 registros (ver DataTable.DEFAULT_PAGE_SIZE). El valor
// interno sigue siendo "0-9" para no tocar los filtros por letra de cada módulo.
const ALPHABET_LABELS: Record<string, string> = { "0-9": "0-50" };

export function FilterLayout({
  children,
  sidebarContent,
  onLetterSelect,
  selectedLetter = "0-9",
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar…"
}: FilterLayoutProps) {
  // El panel arranca siempre cerrado al entrar a la sesión; el usuario lo abre a mano si lo necesita.
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  function toggleSidebarVisible() {
    setIsSidebarVisible((prev) => !prev);
  }

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
      {children}
      {isSidebarVisible && (
        <div className={styles.sidebarOverlay} data-side={filterSide}>
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
    <div className={styles.toggleWrap} data-side={filterSide}>
      <button
        type="button"
        onClick={toggleSidebarVisible}
        className={styles.toggleButton}
        title={isSidebarVisible ? "Ocultar filtros y acciones" : "Mostrar filtros y acciones"}
      >
        {isSidebarVisible ? <CollapseIcon size={13} /> : <Filter size={13} />}
      </button>
    </div>
  );

  return (
    <div className={styles.container}>
      {filterSide === "right" ? (
        <>
          {mainContentEl}
          {alphabetEl}
          {toggleEl}
        </>
      ) : (
        <>
          {toggleEl}
          {alphabetEl}
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
