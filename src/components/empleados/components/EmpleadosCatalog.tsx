"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, Plus, Search } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import type { Empleado } from "../types";
import { EmpleadoCard } from "./EmpleadoCard";
import styles from "./EmpleadosCatalog.module.css";

export function EmpleadosCatalog({
  empleados,
  onNuevo,
  onEditar,
}: {
  empleados: Empleado[];
  onNuevo: () => void;
  onEditar: (empleado: Empleado) => void;
}) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return empleados;
    return empleados.filter(
      (e) =>
        e.nombre.toLowerCase().includes(q) ||
        e.puesto.toLowerCase().includes(q) ||
        e.area.toLowerCase().includes(q)
    );
  }, [empleados, query]);

  const columns: Column<Empleado>[] = [
    { key: "nombre", header: "Nombre" },
    { key: "puesto", header: "Puesto" },
    { key: "area", header: "Área / Departamento" },
    {
      key: "monto_pago",
      header: "Monto de pago",
      render: (item) => `S/ ${item.monto_pago.toFixed(2)}`,
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
            placeholder="Buscar empleado..."
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
        {filtered.length} {filtered.length === 1 ? "empleado" : "empleados"}
      </p>

      {view === "grid" ? (
        <div className={styles.grid}>
          {filtered.map((empleado) => (
            <EmpleadoCard key={empleado.id} empleado={empleado} onClick={() => onEditar(empleado)} />
          ))}
        </div>
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          onRowClick={onEditar}
          emptyMessage="No hay empleados registrados."
        />
      )}
    </div>
  );
}
