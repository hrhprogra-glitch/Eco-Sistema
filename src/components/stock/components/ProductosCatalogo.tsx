"use client";

import { useCallback, useEffect, useState } from "react";
import { PackagePlus, ClipboardList } from "lucide-react";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import filterStyles from "@/components/ui/FilterLayout.module.css";
import fieldStyles from "@/components/ui/formFields.module.css";
import { ProductoForm } from "@/components/inventario/components/ProductoForm";
import { AjusteStockForm } from "./AjusteStockForm";
import type { Producto } from "@/components/inventario/types";

type View = { mode: "list" } | { mode: "form"; producto?: Producto } | { mode: "ajuste" };

const TIPO_LABEL: Record<Producto["tipo"], string> = {
  bienes: "Bienes",
  servicio: "Servicio",
  combo: "Combo",
};

export function ProductosCatalogo({ onDataChanged }: { onDataChanged?: () => void }) {
  const [view, setView] = useState<View>({ mode: "list" });
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("Sin seleccionar");
  const [selectedLetter, setSelectedLetter] = useState("0-9");

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
    { key: "ajustar", label: "Marcar cantidad física", icon: ClipboardList, onClick: () => setView({ mode: "ajuste" }) },
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

  const sidebarContent = (
    <>
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
      {error && <p className={fieldStyles.errorBanner}>{error}</p>}

      <FilterLayout
        sidebarContent={sidebarContent}
        selectedLetter={selectedLetter}
        onLetterSelect={setSelectedLetter}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar producto…"
      >
        <DataTable
          data={productosFiltrados}
          columns={columns}
          onRowClick={(producto) => setView({ mode: "form", producto })}
          emptyMessage={loading ? "Cargando…" : "No hay productos que coincidan con el filtro."}
        />
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

      {view.mode === "ajuste" && (
        <AjusteStockForm
          onCancel={() => setView({ mode: "list" })}
          onSaved={() => {
            setView({ mode: "list" });
            loadProductos();
            onDataChanged?.();
          }}
        />
      )}
    </div>
  );
}
