"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, Plus, Search } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import type { Venta } from "../types";
import { VentaCard } from "./VentaCard";
import styles from "./VentasCatalog.module.css";

export function VentasCatalog({
  ventas,
  onNuevo,
  onEditar,
}: {
  ventas: Venta[];
  onNuevo: () => void;
  onEditar: (venta: Venta) => void;
}) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ventas;
    return ventas.filter(
      (v) =>
        v.contacto_nombre?.toLowerCase().includes(q) ||
        v.estado.toLowerCase().includes(q)
    );
  }, [ventas, query]);

  const columns: Column<Venta>[] = [
    { key: "id", header: "Número", render: (item) => `S00${item.id}` },
    { key: "contacto_nombre", header: "Cliente", render: (item) => item.contacto_nombre || "Sin cliente" },
    {
      key: "fecha",
      header: "Fecha",
      render: (item) => new Date(`${item.fecha}T00:00:00`).toLocaleDateString("es-PE"),
    },
    { key: "total", header: "Total", render: (item) => `S/ ${item.total.toFixed(2)}` },
    {
      key: "estado",
      header: "Estado",
      render: (item) => {
        let color = "#546e7a";
        if (item.estado === "confirmada") color = "#1976d2";
        if (item.estado === "facturada") color = "#388e3c";
        if (item.estado === "cancelada") color = "#d32f2f";
        return (
          <span
            style={{
              color,
              fontWeight: 700,
              fontSize: "12px",
              textTransform: "uppercase",
              backgroundColor: `${color}15`,
              padding: "4px 8px",
              borderRadius: "4px"
            }}
          >
            {item.estado}
          </span>
        );
      },
    },
  ];

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
            placeholder="Buscar venta o cliente..."
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
        {filtered.length} {filtered.length === 1 ? "venta" : "ventas"}
      </p>

      {view === "grid" ? (
        <div className={styles.grid}>
          {filtered.map((venta) => (
            <VentaCard key={venta.id} venta={venta} onClick={() => onEditar(venta)} />
          ))}
        </div>
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          onRowClick={onEditar}
          emptyMessage="No hay ventas registradas."
        />
      )}
    </div>
  );
}
