"use client";

import React, { useState } from "react";
import styles from "./FilterLayout.module.css";
import { Filter, ChevronRight, Search } from "lucide-react";

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

export function FilterLayout({
  children,
  sidebarContent,
  onLetterSelect,
  selectedLetter = "0-9",
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar…"
}: FilterLayoutProps) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  return (
    <div className={styles.container}>
      {/* 1. Main Table Content (Flex 1) */}
      <div className={styles.mainContent}>
        {children}
      </div>

      {/* 2. Alphabet Index (Narrow, between table and sidebar) */}
      <div className={styles.alphabetIndex}>
        {ALPHABET.map((letter) => (
          <div
            key={letter}
            className={styles.letter}
            data-active={selectedLetter === letter ? "" : undefined}
            onClick={() => onLetterSelect?.(letter)}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Toggle Button Column */}
      <div 
        style={{ 
          width: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          borderLeft: '1px solid var(--border-color)',
          background: 'var(--bg-surface)'
        }}
      >
        <button
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          style={{
            border: 'none',
            background: 'transparent',
            padding: '8px 4px',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--eco-azul)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          title={isSidebarVisible ? "Ocultar filtros" : "Mostrar filtros"}
        >
          {isSidebarVisible ? <ChevronRight size={16} /> : <Filter size={16} />}
        </button>
      </div>

      {/* 3. Filter Sidebar (Right side) */}
      <div className={styles.sidebar} data-hidden={isSidebarVisible ? undefined : ""}>
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
