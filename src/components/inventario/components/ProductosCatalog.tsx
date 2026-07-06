"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, Plus, Search } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import type { Producto } from "../types";
import { ProductoCard } from "./ProductoCard";
import styles from "./ProductosCatalog.module.css";

export function ProductosCatalog({
  products,
  onCreate,
  onEdit,
}: {
  products: Producto[];
  onCreate: () => void;
  onEdit: (product: Producto) => void;
}) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [products, query]);

  const columns: Column<Producto>[] = [
    { key: "nombre", header: "Nombre" },
    { key: "sku", header: "Código" },
    {
      key: "stock",
      header: "Stock",
      render: (item) => (
        <span
          style={{
            color: item.rastrear_inventario && item.stock <= item.limite_stock ? "#ef4444" : undefined,
            fontWeight: item.rastrear_inventario && item.stock <= item.limite_stock ? 700 : 400,
          }}
        >
          {item.rastrear_inventario ? item.stock : "—"}
        </span>
      ),
    },
    { key: "precio", header: "Precio", render: (item) => `S/ ${item.precio.toFixed(2)}` },
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
            placeholder="Buscar producto..."
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
        {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
      </p>

      {view === "grid" ? (
        <div className={styles.grid}>
          {filtered.map((product) => (
            <ProductoCard key={product.id} producto={product} onClick={() => onEdit(product)} />
          ))}
        </div>
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          onRowClick={onEdit}
          emptyMessage="No hay productos en el inventario."
        />
      )}
    </div>
  );
}
