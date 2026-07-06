"use client";

import { useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { apps } from "@/components/lib/apps";
import { moduleIcons } from "@/components/moduleIcons";
import { Search, SlidersHorizontal, X } from "lucide-react";
import styles from "./AppsClient.module.css";
import pageStyles from "./page.module.css";

export function AppsClient() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(apps.map((app) => app.category)));

  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? app.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.controlsHeader}>
        <button 
          className={`${styles.toggleButton} ${showFilters ? styles.active : ""}`}
          onClick={() => {
            setShowFilters(!showFilters);
            if (showFilters) {
              setSearchQuery("");
              setSelectedCategory(null);
            }
          }}
          title="Buscar y filtrar"
        >
          <SlidersHorizontal size={18} />
          <span>Filtros</span>
        </button>
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar aplicación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              autoFocus
            />
            {searchQuery && (
              <button className={styles.clearSearch} onClick={() => setSearchQuery("")}>
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className={styles.categories}>
            <button 
              className={`${styles.categoryPill} ${selectedCategory === null ? styles.activeCategory : ""}`}
              onClick={() => setSelectedCategory(null)}
            >
              Todas
            </button>
            {categories.map(category => (
              <button
                key={category}
                className={`${styles.categoryPill} ${selectedCategory === category ? styles.activeCategory : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className={pageStyles.grid}>
        {filteredApps.length > 0 ? (
          filteredApps.map((app, index) => {
            const Icon = moduleIcons[app.slug];
            return (
              <Link
                key={app.slug}
                href={`/${app.slug}`}
                className={pageStyles.card}
                style={
                  {
                    "--card-color": app.color,
                    "--card-delay": `${index * 35}ms`,
                  } as CSSProperties
                }
              >
                <span className={pageStyles.iconTile}>
                  {Icon ? <Icon size={24} /> : null}
                </span>
                <span className={pageStyles.name}>{app.name}</span>
              </Link>
            );
          })
        ) : (
          <div className={styles.noResults}>
            No se encontraron aplicaciones.
          </div>
        )}
      </main>
    </div>
  );
}
