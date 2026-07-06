"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import type { Piscina } from "../types";
import { PiscinaCard } from "./PiscinaCard";
import styles from "./PiscinasCatalog.module.css";

export function PiscinasCatalog({
  piscinas,
  onNuevo,
  onEditar,
}: {
  piscinas: Piscina[];
  onNuevo: () => void;
  onEditar: (piscina: Piscina) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return piscinas;
    return piscinas.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.contacto_nombre.toLowerCase().includes(q) ||
        p.ubicacion.toLowerCase().includes(q)
    );
  }, [piscinas, query]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.newButton} onClick={onNuevo}>
          <Plus size={16} />
          Nuevo
        </button>

        <div className={styles.search}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por piscina, cliente o ubicación..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <p className={styles.count}>
        {filtered.length} {filtered.length === 1 ? "piscina" : "piscinas"}
      </p>

      <div className={styles.grid}>
        {filtered.map((piscina) => (
          <PiscinaCard key={piscina.id} piscina={piscina} onClick={() => onEditar(piscina)} />
        ))}
      </div>
    </div>
  );
}
