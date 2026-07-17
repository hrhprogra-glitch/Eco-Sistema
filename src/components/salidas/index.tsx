"use client";

import { useCallback, useEffect, useState } from "react";
import { PackageMinus } from "lucide-react";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import fieldStyles from "@/components/ui/formFields.module.css";
import { SalidaForm } from "./components/SalidaForm";
import type { MovimientoStock } from "./types";

type View = { mode: "list" } | { mode: "salida" };

export default function SalidasModule() {
  const [view, setView] = useState<View>({ mode: "list" });
  const [salidas, setSalidas] = useState<MovimientoStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadSalidas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/movimientos");
      if (!res.ok) throw new Error("No se pudo cargar el registro de salidas.");
      const data: MovimientoStock[] = await res.json();
      setSalidas(data.filter((m) => m.tipo === "salida"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSalidas();
  }, [loadSalidas]);

  const columns: Column<MovimientoStock>[] = [
    { key: "fecha", header: "Fecha", render: (m) => m.fecha?.slice(0, 10) },
    { key: "producto_nombre", header: "Producto" },
    { key: "almacen_nombre", header: "Almacén" },
    { key: "lote_numero", header: "Lote", render: (m) => m.lote_numero || (m.lote_id ? `Lote ${m.lote_id.slice(0, 8)}` : "—") },
    { key: "cantidad", header: "Cantidad", render: (m) => <span style={{ color: "var(--status-error)", fontWeight: 600 }}>-{m.cantidad}</span> },
    { key: "motivo", header: "Motivo" },
  ];

  const actions: ModuleAction[] = [
    { key: "nueva-salida", label: "Nueva salida", icon: PackageMinus, tone: "primary", onClick: () => setView({ mode: "salida" }) },
  ];

  const salidasFiltradas = salidas.filter((m) => {
    if (!searchTerm.trim()) return true;
    const termino = searchTerm.trim().toLowerCase();
    return [m.producto_nombre, m.motivo, m.almacen_nombre].some((campo) => campo?.toLowerCase().includes(termino));
  });

  const sidebarContent = (
    <FilterSection title="Acciones">
      <ModuleActions actions={actions} variant="sidebar" />
    </FilterSection>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      {error && <p className={fieldStyles.errorBanner}>{error}</p>}

      <FilterLayout
        sidebarContent={sidebarContent}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por producto o motivo…"
      >
        <DataTable
          data={salidasFiltradas}
          columns={columns}
          emptyMessage={loading ? "Cargando…" : "No hay salidas registradas todavía."}
        />
      </FilterLayout>

      {view.mode === "salida" && (
        <SalidaForm
          onCancel={() => setView({ mode: "list" })}
          onSaved={() => {
            setView({ mode: "list" });
            loadSalidas();
          }}
        />
      )}
    </div>
  );
}
