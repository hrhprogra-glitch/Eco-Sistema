"use client";

import { useCallback, useEffect, useState } from "react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FilterLayout } from "@/components/ui/FilterLayout";
import fieldStyles from "@/components/ui/formFields.module.css";
import { LotesDetalle } from "./components/LotesDetalle";
import type { StockPorAlmacen } from "./types";

export default function StockModule() {
  const [stock, setStock] = useState<StockPorAlmacen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [detalle, setDetalle] = useState<{ producto_id: string; producto_nombre: string } | null>(null);

  const loadStock = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stock");
      if (!res.ok) throw new Error("No se pudo cargar el stock.");
      setStock(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStock();
  }, [loadStock]);

  const columns: Column<StockPorAlmacen>[] = [
    { key: "producto_nombre", header: "Producto", render: (s) => <span style={{ color: "var(--accent-text)", fontWeight: 600 }}>{s.producto_nombre}</span> },
    { key: "sku", header: "SKU" },
    { key: "almacen_nombre", header: "Almacén" },
    { key: "cantidad", header: "Cantidad", render: (s) => `${s.cantidad} ${s.unidad}` },
  ];

  const stockFiltrado = stock.filter((s) => {
    if (!searchTerm.trim()) return true;
    const termino = searchTerm.trim().toLowerCase();
    return [s.producto_nombre, s.sku].some((campo) => campo?.toLowerCase().includes(termino));
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      {error && <p className={fieldStyles.errorBanner}>{error}</p>}

      <FilterLayout
        sidebarContent={null}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar producto…"
      >
        <DataTable
          data={stockFiltrado}
          columns={columns}
          onRowClick={(s) => setDetalle({ producto_id: s.producto_id, producto_nombre: s.producto_nombre })}
          emptyMessage={loading ? "Cargando…" : "Todavía no hay stock cargado (confirmá una entrada para generar el primer lote)."}
        />
      </FilterLayout>

      {detalle && (
        <LotesDetalle
          productoId={detalle.producto_id}
          productoNombre={detalle.producto_nombre}
          onClose={() => setDetalle(null)}
        />
      )}
    </div>
  );
}
