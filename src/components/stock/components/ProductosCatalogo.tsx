"use client";

import { useCallback, useEffect, useState } from "react";
import { PackagePlus, Package, Layers } from "lucide-react";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import filterStyles from "@/components/ui/FilterLayout.module.css";
import fieldStyles from "@/components/ui/formFields.module.css";
import { ProductoForm } from "@/components/inventario/components/ProductoForm";
import { StockResumen } from "./StockResumen";
import { useSession } from "@/components/session/SessionProvider";
import type { Producto } from "@/components/inventario/types";
import type { StockVista } from "..";

type View = { mode: "list" } | { mode: "form"; producto?: Producto };

const TIPO_LABEL: Record<Producto["tipo"], string> = {
  bienes: "Bienes",
  servicio: "Servicio",
  combo: "Combo",
};

export function ProductosCatalogo({
  vista,
  onCambiarVista,
  refreshKey,
  onDataChanged,
}: {
  vista?: StockVista;
  onCambiarVista?: (vista: StockVista) => void;
  refreshKey?: number;
  onDataChanged?: () => void;
}) {
  const [view, setView] = useState<View>({ mode: "list" });
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("Sin seleccionar");
  const [selectedLetter, setSelectedLetter] = useState("0-9");
  const { permisos } = useSession();

  const loadProductos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/productos");
      if (!res.ok) throw new Error("No se pudieron cargar los productos.");
      setProductos(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  const columns: Column<Producto>[] = [
    { key: "nombre", header: "Nombre", render: (p) => <span style={{ color: "var(--accent-text)", fontWeight: 600 }}>{p.nombre}</span> },
    { key: "sku", header: "SKU" },
    { key: "categoria", header: "Categoría", render: (p) => p.categoria || "—" },
    {
      key: "stock",
      header: "Stock",
      render: (p) => (
        <span style={{ color: p.rastrear_inventario && p.stock <= p.limite_stock ? "var(--status-error)" : "inherit" }}>
          {p.rastrear_inventario ? `${p.stock} ${p.unidad}` : "—"}
        </span>
      ),
    },
    { key: "precio", header: "Precio", render: (p) => Number(p.precio).toFixed(2) },
  ];

  const actions: ModuleAction[] = [
    { key: "nuevo", label: "Nuevo producto", icon: PackagePlus, tone: "primary", onClick: () => setView({ mode: "form" }) },
  ];

  const productosFiltrados = productos.filter((producto) => {
    if (searchTerm.trim()) {
      const termino = searchTerm.trim().toLowerCase();
      const coincide = [producto.nombre, producto.sku, producto.categoria]
        .some((campo) => campo?.toLowerCase().includes(termino));
      if (!coincide) return false;
    }

    if (selectedLetter !== "0-9") {
      const inicial = producto.nombre.trim().charAt(0).toLowerCase();
      if (inicial !== selectedLetter) return false;
    }

    if (tipoFiltro !== "Sin seleccionar" && TIPO_LABEL[producto.tipo] !== tipoFiltro) {
      return false;
    }

    return true;
  });

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

      <FilterSection title="Tipo">
        {["Sin seleccionar", ...Object.values(TIPO_LABEL)].map((tipo) => (
          <label key={tipo} className={filterStyles.radioLabel}>
            <input
              type="checkbox"
              className={filterStyles.radioInput}
              checked={tipoFiltro === tipo}
              onChange={() => setTipoFiltro(tipo)}
            />
            {tipo}
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
        selectedLetter={selectedLetter}
        onLetterSelect={setSelectedLetter}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar producto…"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", height: "100%", minHeight: 0, overflowY: "auto", padding: "16px" }}>
          <StockResumen key={refreshKey} />
          <DataTable
            data={productosFiltrados}
            columns={columns}
            onRowClick={(producto) => setView({ mode: "form", producto })}
            emptyMessage={loading ? "Cargando…" : "No hay productos que coincidan con el filtro."}
          />
        </div>
      </FilterLayout>

      {view.mode === "form" && (
        <ProductoForm
          producto={view.producto}
          onCancel={() => setView({ mode: "list" })}
          onSaved={() => {
            setView({ mode: "list" });
            loadProductos();
            onDataChanged?.();
          }}
          onDeleted={() => {
            setView({ mode: "list" });
            loadProductos();
            onDataChanged?.();
          }}
        />
      )}
    </div>
  );
}
