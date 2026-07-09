"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, Plus, Search } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import type { Gasto } from "../types";
import { GastoCard } from "./GastoCard";
import styles from "./GastosCatalog.module.css";

export function GastosCatalog({
  gastos,
  onCreate,
  onEdit,
}: {
  gastos: Gasto[];
  onCreate: () => void;
  onEdit: (gasto: Gasto) => void;
}) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return gastos;
    return gastos.filter(
      (g) =>
        g.concepto.toLowerCase().includes(q) ||
        g.categoria.toLowerCase().includes(q)
    );
  }, [gastos, query]);

  const columns: Column<Gasto>[] = [
    { key: "concepto", header: "Concepto" },
    { key: "categoria", header: "Categoría" },
    {
      key: "fecha",
      header: "Fecha",
      render: (item) => new Date(`${item.fecha}T00:00:00`).toLocaleDateString("es-PE"),
    },
    { key: "monto", header: "Monto", render: (item) => `S/ ${item.monto.toFixed(2)}` },
    {
      key: "estado",
      header: "Estado",
      render: (item) => (
        <span
          style={{
            color: item.estado === "pagado" ? "#388e3c" : "#f57c00",
            fontWeight: 700,
            fontSize: "12px",
            textTransform: "uppercase",
          }}
        >
          {item.estado}
        </span>
      ),
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.newButton} onClick={onCreate}>
          <Plus size={16} />
          Nuevo
        </button>

        <div className={styles.search}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar gasto..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.viewToggle}>
          <button
            type="button"
            className={`${styles.viewButton} ${view === "grid" ? styles.viewActive : ""}`}
            onClick={() => setView("grid")}
            aria-label="Vista de cuadrícula"
            title="Vista de cuadrícula"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            className={`${styles.viewButton} ${view === "list" ? styles.viewActive : ""}`}
            onClick={() => setView("list")}
            aria-label="Vista de lista"
            title="Vista de lista"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      <p className={styles.count}>
        {filtered.length} {filtered.length === 1 ? "gasto" : "gastos"}
      </p>

      {view === "grid" ? (
        <div className={styles.grid}>
          {filtered.map((gasto) => (
            <GastoCard key={gasto.id} gasto={gasto} onClick={() => onEdit(gasto)} />
          ))}
        </div>
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          onRowClick={onEdit}
          emptyMessage="No hay gastos registrados."
        />
      )}
    </div>
  );
}
