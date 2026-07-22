"use client";

import { useCallback, useEffect, useState } from "react";
import { Package, Layers, PackagePlus } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import filterStyles from "@/components/ui/FilterLayout.module.css";
import fieldStyles from "@/components/ui/formFields.module.css";
import { LotesDetalle } from "./LotesDetalle";
import { LoteForm } from "./LoteForm";
import { StockResumen } from "./StockResumen";
import { useSession } from "@/components/session/SessionProvider";
import type { Producto } from "@/components/inventario/types";
import type { Almacen } from "@/components/movimientos/types";
import { nivelStock, NIVEL_STOCK_LABEL, type NivelStock } from "../types";
import type { StockVista } from "..";

export function StockPorAlmacen({
  vista,
  onCambiarVista,
  refreshKey,
}: {
  vista?: StockVista;
  onCambiarVista?: (vista: StockVista) => void;
  refreshKey?: number;
}) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [nivelFiltro, setNivelFiltro] = useState<NivelStock | "Sin seleccionar">("Sin seleccionar");
  const [detalle, setDetalle] = useState<{ producto_id: string; producto_nombre: string } | null>(null);
  const [creandoLote, setCreandoLote] = useState(false);
  const [almacenId, setAlmacenId] = useState("");
  const { permisos } = useSession();

  // Solo hay un almacén (ver sql/023_inventario_catalogos.sql): se completa solo con el
  // único que devuelve /api/almacenes, para "Nuevo lote" desde el panel de acciones.
  useEffect(() => {
    fetch("/api/almacenes")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Almacen[]) => setAlmacenId(data[0]?.id ?? ""))
      .catch(() => setAlmacenId(""));
  }, []);

  // Se lista desde /api/productos (no /api/stock) para que un producto sin ningún lote
  // todavía también aparezca -- si no, nunca se podría entrar a cargarle el primer lote.
  // productos.stock ya es el total agregado (lo mantienen al día entradas/ajustes/lotes),
  // no hace falta volver a sumarlo acá.
  const loadProductos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/productos");
      if (!res.ok) throw new Error("No se pudo cargar el stock.");
      const data: Producto[] = await res.json();
      setProductos(data.filter((p) => p.rastrear_inventario));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProductos();
  }, [loadProductos, refreshKey]);

  const NIVEL_COLOR: Record<NivelStock, string> = {
    "sin-stock": "var(--status-error)",
    bajo: "var(--status-pending)",
    medio: "var(--status-offline)",
    alto: "var(--status-online)",
  };

  const columns: Column<Producto>[] = [
    { key: "nombre", header: "Producto", render: (p) => <span style={{ color: "var(--accent-text)", fontWeight: 600 }}>{p.nombre}</span> },
    { key: "sku", header: "SKU" },
    { key: "stock", header: "Cantidad", render: (p) => `${p.stock} ${p.unidad}` },
    {
      key: "limite_stock",
      header: "Nivel",
      render: (p) => {
        const nivel = nivelStock(p.stock, p.limite_stock);
        return <span style={{ color: NIVEL_COLOR[nivel], fontWeight: 600 }}>{NIVEL_STOCK_LABEL[nivel]}</span>;
      },
    },
  ];

  const productosFiltrados = productos.filter((p) => {
    if (searchTerm.trim()) {
      const termino = searchTerm.trim().toLowerCase();
      const coincide = [p.nombre, p.sku].some((campo) => campo?.toLowerCase().includes(termino));
      if (!coincide) return false;
    }

    if (nivelFiltro !== "Sin seleccionar" && nivelStock(p.stock, p.limite_stock) !== nivelFiltro) {
      return false;
    }

    return true;
  });

  const actions: ModuleAction[] = [
    { key: "nuevo-lote", label: "Nuevo lote", icon: PackagePlus, tone: "primary", onClick: () => setCreandoLote(true) },
  ];

  const vistaActions: ModuleAction[] = onCambiarVista
    ? [
        { key: "productos", label: "Productos", icon: Package, active: vista === "productos", onClick: () => onCambiarVista("productos") },
        { key: "lotes", label: "Lotes", icon: Layers, active: vista === "lotes", onClick: () => onCambiarVista("lotes") },
      ].filter(action => permisos.includes(`stock.${action.key}`))
    : [];

  const sidebarContent = (
    <>
      {vistaActions.length > 0 && (
        <FilterSection title="Vista">
          <ModuleActions actions={vistaActions} variant="sidebar" />
        </FilterSection>
      )}
      <FilterSection title="Acciones">
        <ModuleActions actions={actions} variant="sidebar" />
      </FilterSection>

      <FilterSection title="Nivel de stock">
        {(["Sin seleccionar", "sin-stock", "bajo", "medio", "alto"] as const).map((nivel) => (
          <label key={nivel} className={filterStyles.radioLabel}>
            <input
              type="checkbox"
              className={filterStyles.radioInput}
              checked={nivelFiltro === nivel}
              onChange={() => setNivelFiltro(nivel)}
            />
            {nivel === "Sin seleccionar" ? nivel : NIVEL_STOCK_LABEL[nivel]}
          </label>
        ))}
      </FilterSection>
    </>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      <FilterLayout
        errorBanner={error ? <p className={fieldStyles.errorBanner}>{error}</p> : null}
        sidebarContent={sidebarContent}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar producto…"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%", minHeight: 0, overflowY: "auto", padding: "16px" }}>
          <StockResumen key={refreshKey} />
          <DataTable
            data={productosFiltrados}
            columns={columns}
            onRowClick={(p) => setDetalle({ producto_id: p.id, producto_nombre: p.nombre })}
            emptyMessage={loading ? "Cargando…" : "No hay productos con seguimiento de inventario."}
          />
        </div>
      </FilterLayout>

      {detalle && (
        <LotesDetalle
          productoId={detalle.producto_id}
          productoNombre={detalle.producto_nombre}
          onClose={() => setDetalle(null)}
          onCambio={loadProductos}
        />
      )}

      {creandoLote && (
        <LoteForm
          almacenId={almacenId}
          onCancel={() => setCreandoLote(false)}
          onSaved={() => {
            setCreandoLote(false);
            loadProductos();
          }}
        />
      )}
    </div>
  );
}
