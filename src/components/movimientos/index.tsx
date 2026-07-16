"use client";

import { useCallback, useEffect, useState } from "react";
import { FileInput, PackageMinus } from "lucide-react";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import filterStyles from "@/components/ui/FilterLayout.module.css";
import fieldStyles from "@/components/ui/formFields.module.css";
import { EntradaForm } from "./components/EntradaForm";
import { SalidaForm } from "./components/SalidaForm";
import type { Entrada, MovimientoStock } from "./types";

type View =
  | { mode: "list" }
  | { mode: "entrada"; entrada?: Entrada }
  | { mode: "salida" };

const TIPO_LABEL: Record<MovimientoStock["tipo"], string> = {
  entrada: "Entrada",
  salida: "Salida",
  ajuste: "Ajuste",
};

export default function MovimientosModule() {
  const [view, setView] = useState<View>({ mode: "list" });
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
  const [borradores, setBorradores] = useState<Entrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("Sin seleccionar");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [movRes, entRes] = await Promise.all([fetch("/api/movimientos"), fetch("/api/entradas")]);
      if (!movRes.ok) throw new Error("No se pudo cargar el registro de movimientos.");
      setMovimientos(await movRes.json());
      if (entRes.ok) {
        const entradas: Entrada[] = await entRes.json();
        setBorradores(entradas.filter((e) => e.estado === "borrador"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function abrirBorrador(entradaResumen: Entrada) {
    const res = await fetch(`/api/entradas/${entradaResumen.id}`);
    if (res.ok) {
      setView({ mode: "entrada", entrada: await res.json() });
    }
  }

  const movimientosColumns: Column<MovimientoStock>[] = [
    { key: "fecha", header: "Fecha", render: (m) => m.fecha?.slice(0, 10) },
    {
      key: "tipo",
      header: "Tipo",
      render: (m) => (
        <span style={{ color: m.tipo === "entrada" ? "var(--status-online)" : m.tipo === "salida" ? "var(--status-error)" : "var(--text-secondary)", fontWeight: 600 }}>
          {TIPO_LABEL[m.tipo]}
        </span>
      ),
    },
    { key: "producto_nombre", header: "Producto" },
    { key: "almacen_nombre", header: "Almacén" },
    { key: "lote_numero", header: "Lote", render: (m) => m.lote_numero || (m.lote_id ? `Lote ${m.lote_id.slice(0, 8)}` : "—") },
    { key: "cantidad", header: "Cantidad", render: (m) => `${m.tipo === "salida" ? "-" : "+"}${m.cantidad}` },
    { key: "motivo", header: "Motivo" },
  ];

  const borradoresColumns: Column<Entrada>[] = [
    { key: "numero", header: "N°" },
    { key: "proveedor_nombre", header: "Proveedor", render: (e) => e.proveedor_nombre || "—" },
    { key: "fecha", header: "Fecha", render: (e) => e.fecha?.slice(0, 10) },
    { key: "total", header: "Total", render: (e) => Number(e.total).toFixed(2) },
  ];

  const actions: ModuleAction[] = [
    { key: "nueva-entrada", label: "Nueva entrada", icon: FileInput, tone: "primary", onClick: () => setView({ mode: "entrada" }) },
    { key: "nueva-salida", label: "Nueva salida", icon: PackageMinus, onClick: () => setView({ mode: "salida" }) },
  ];

  const movimientosFiltrados = movimientos.filter((m) => {
    if (searchTerm.trim()) {
      const termino = searchTerm.trim().toLowerCase();
      const coincide = [m.producto_nombre, m.motivo, m.almacen_nombre].some((campo) => campo?.toLowerCase().includes(termino));
      if (!coincide) return false;
    }
    if (tipoFiltro !== "Sin seleccionar" && TIPO_LABEL[m.tipo] !== tipoFiltro) return false;
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

  if (view.mode === "entrada") {
    return (
      <EntradaForm
        entrada={view.entrada}
        onCancel={() => setView({ mode: "list" })}
        onSaved={() => {
          setView({ mode: "list" });
          loadAll();
        }}
        onDeleted={() => {
          setView({ mode: "list" });
          loadAll();
        }}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      {error && <p className={fieldStyles.errorBanner}>{error}</p>}

      <FilterLayout
        sidebarContent={sidebarContent}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por producto o motivo…"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 16px", overflowY: "auto" }}>
          {borradores.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 8 }}>
                Entradas en borrador (sin confirmar todavía)
              </p>
              <DataTable
                data={borradores}
                columns={borradoresColumns}
                onRowClick={abrirBorrador}
                emptyMessage="Sin borradores."
              />
            </div>
          )}

          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 8 }}>
              Registro
            </p>
            <DataTable
              data={movimientosFiltrados}
              columns={movimientosColumns}
              emptyMessage={loading ? "Cargando…" : "No hay movimientos que coincidan con el filtro."}
            />
          </div>
        </div>
      </FilterLayout>

      {view.mode === "salida" && (
        <SalidaForm
          onCancel={() => setView({ mode: "list" })}
          onSaved={() => {
            setView({ mode: "list" });
            loadAll();
          }}
        />
      )}
    </div>
  );
}
