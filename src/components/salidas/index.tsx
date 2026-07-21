"use client";

import { useCallback, useEffect, useState } from "react";
import { Zap, History } from "lucide-react";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import { FloatingWindow } from "@/components/ui/FloatingWindow";
import fieldStyles from "@/components/ui/formFields.module.css";
import { SalidaPOS } from "./components/SalidaPOS";
import { useSession } from "@/components/session/SessionProvider";
import type { MovimientoStock } from "./types";

export type SalidasVista = "rapida" | "historial";

export default function SalidasModule() {
  const [vista, setVista] = useState<SalidasVista>("rapida");
  const { permisos } = useSession();
  const [salidas, setSalidas] = useState<MovimientoStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFecha, setFilterFecha] = useState("");
  const [filterCliente, setFilterCliente] = useState("");
  const [filterTrabajador, setFilterTrabajador] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("0-9");

  const [editModal, setEditModal] = useState<MovimientoStock | null>(null);
  const [editCantidad, setEditCantidad] = useState("");
  const [editMotivo, setEditMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);

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

  // Se recarga cada vez que se entra al Historial, para que muestre al toque las salidas
  // recién confirmadas desde la pantalla de Salida rápida sin necesitar recargar la página.
  useEffect(() => {
    if (vista === "historial") loadSalidas();
  }, [vista, loadSalidas]);

  if (vista === "rapida") {
    return <SalidaPOS vista={vista} onCambiarVista={setVista} />;
  }

  const columns: Column<MovimientoStock>[] = [
    { key: "fecha", header: "Fecha", render: (m) => m.fecha?.slice(0, 10) },
    { key: "producto_nombre", header: "Producto" },
    { key: "almacen_nombre", header: "Almacén" },
    { key: "lote_numero", header: "Lote", render: (m) => m.lote_numero || (m.lote_id ? `Lote ${m.lote_id.slice(0, 8)}` : "—") },
    { key: "cantidad", header: "Cantidad", render: (m) => <span style={{ color: "var(--status-error)", fontWeight: 600 }}>-{m.cantidad}</span> },
    { key: "motivo", header: "Motivo" },
    {
      key: "acciones" as keyof MovimientoStock,
      header: "",
      render: (m) => (
        <button
          type="button"
          className={fieldStyles.button}
          style={{ padding: "4px 8px", fontSize: "11px", background: "var(--bg-surface)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
          onClick={() => {
            setEditModal(m);
            setEditCantidad(m.cantidad.toString());
            setEditMotivo(m.motivo);
          }}
        >
          Editar
        </button>
      ),
    },
  ];

  const vistaActions: ModuleAction[] = [
    { key: "rapida", label: "Salida rápida", icon: Zap, active: false, onClick: () => setVista("rapida") },
    { key: "historial", label: "Historial", icon: History, active: true, onClick: () => setVista("historial") },
  ].filter(action => permisos.includes(`salidas.${action.key}`));

  useEffect(() => {
    if (vistaActions.length > 0 && !vistaActions.find(a => a.key === vista)) {
      setVista(vistaActions[0].key as SalidasVista);
    }
  }, [permisos, vista, vistaActions]);

  const salidasFiltradas = salidas.filter((m) => {
    // 1. Buscador texto (producto_nombre o motivo)
    if (searchTerm) {
      const pName = m.producto_nombre?.toLowerCase() || "";
      const mText = m.motivo?.toLowerCase() || "";
      if (!pName.includes(searchTerm.toLowerCase()) && !mText.includes(searchTerm.toLowerCase())) return false;
    }

    // 2. Filtro Fecha
    if (filterFecha) {
      const movDate = new Date(m.created_at || m.fecha).toISOString().split("T")[0];
      if (movDate !== filterFecha) return false;
    }

    // 3. Filtro Cliente (buscamos en el motivo)
    if (filterCliente.trim() && !m.motivo.toLowerCase().includes(`cliente: ${filterCliente.trim().toLowerCase()}`)) return false;

    // 4. Filtro Trabajador (buscamos en el motivo)
    if (filterTrabajador.trim() && !m.motivo.toLowerCase().includes(`trab: ${filterTrabajador.trim().toLowerCase()}`)) return false;

    // 5. Filtro Letra Inicial
    if (selectedLetter !== "0-9") {
      const pName = m.producto_nombre || m.motivo || "";
      const inicial = pName.trim().charAt(0).toLowerCase();
      if (inicial !== selectedLetter) return false;
    }

    return true;
  });

  async function handleGuardarEdicion() {
    if (!editModal || !editCantidad || Number(editCantidad) <= 0) return;
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch(`/api/movimientos/${editModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cantidad: Number(editCantidad),
          motivo: editMotivo,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar salida.");
      }
      setEditModal(null);
      loadSalidas();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setGuardando(false);
    }
  }

  const sidebarContent = (
    <>
      <FilterSection title="Vista">
        <ModuleActions actions={vistaActions} variant="sidebar" />
      </FilterSection>
      <FilterSection title="Filtros Adicionales">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label className={fieldStyles.label} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            Fecha
            <input type="date" className={fieldStyles.input} value={filterFecha} onChange={(e) => setFilterFecha(e.target.value)} />
          </label>
          <label className={fieldStyles.label} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            Cliente
            <input type="text" placeholder="Ej. Juan..." className={fieldStyles.input} value={filterCliente} onChange={(e) => setFilterCliente(e.target.value)} />
          </label>
          <label className={fieldStyles.label} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            Trabajador / Obra
            <input type="text" placeholder="Ej. Carlos..." className={fieldStyles.input} value={filterTrabajador} onChange={(e) => setFilterTrabajador(e.target.value)} />
          </label>
        </div>
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
        searchPlaceholder="Buscar por producto o motivo…"
      >
        <div style={{ padding: "16px", height: "100%", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <History size={24} style={{ color: "var(--accent-color)" }} />
            <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Historial de Salidas</h1>
          </div>
          <DataTable
            data={salidasFiltradas}
            columns={columns}
            emptyMessage={loading ? "Cargando…" : "No hay salidas registradas todavía."}
          />
        </div>
      </FilterLayout>

      {editModal && (
        <FloatingWindow title="Editar Salida" onClose={() => setEditModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Editando salida de <strong>{editModal.producto_nombre}</strong>.
            </p>
            <label className={fieldStyles.label} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              Cantidad
              <input
                type="number"
                min="1"
                step="1"
                className={fieldStyles.input}
                value={editCantidad}
                onChange={(e) => setEditCantidad(e.target.value)}
              />
            </label>
            <label className={fieldStyles.label} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              Motivo / Detalles
              <input
                type="text"
                className={fieldStyles.input}
                value={editMotivo}
                onChange={(e) => setEditMotivo(e.target.value)}
              />
            </label>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button type="button" className={fieldStyles.button} onClick={() => setEditModal(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className={fieldStyles.buttonPrimary}
                onClick={handleGuardarEdicion}
                disabled={guardando || !editCantidad || Number(editCantidad) <= 0}
              >
                {guardando ? "Guardando…" : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </FloatingWindow>
      )}
    </div>
  );
}
