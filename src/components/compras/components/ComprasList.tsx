"use client";

import { useCallback, useEffect, useState } from "react";
import { FileInput, ShoppingCart, Truck } from "lucide-react";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import filterStyles from "@/components/ui/FilterLayout.module.css";
import fieldStyles from "@/components/ui/formFields.module.css";
import { EntradaForm } from "./EntradaForm";
import type { Entrada } from "../types";
import type { ComprasVista } from "..";

type View = { mode: "list" } | { mode: "entrada"; entrada?: Entrada };

const ESTADO_LABEL: Record<Entrada["estado"], string> = {
  borrador: "Borrador",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
};

export function ComprasList({
  vista,
  onCambiarVista,
}: {
  vista?: ComprasVista;
  onCambiarVista?: (vista: ComprasVista) => void;
}) {
  const [view, setView] = useState<View>({ mode: "list" });
  const [compras, setCompras] = useState<Entrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("0-9");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("Sin seleccionar");

  const loadCompras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/entradas");
      if (!res.ok) throw new Error("No se pudieron cargar las compras.");
      setCompras(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompras();
  }, [loadCompras]);

  async function abrirCompra(resumen: Entrada) {
    const res = await fetch(`/api/entradas/${resumen.id}`);
    if (res.ok) {
      setView({ mode: "entrada", entrada: await res.json() });
    }
  }

  const columns: Column<Entrada>[] = [
    { key: "numero", header: "N°" },
    { key: "proveedor_nombre", header: "Proveedor (razón social)", render: (e) => e.proveedor_nombre || "—" },
    { key: "numero_factura_proveedor", header: "N° factura", render: (e) => e.numero_factura_proveedor || "—" },
    { key: "fecha", header: "Fecha de compra", render: (e) => e.fecha?.slice(0, 10) },
    {
      key: "estado",
      header: "Estado",
      render: (e) => (
        <span
          style={{
            color: e.estado === "confirmada" ? "var(--status-online)" : e.estado === "cancelada" ? "var(--status-error)" : "var(--text-secondary)",
            fontWeight: 600,
          }}
        >
          {ESTADO_LABEL[e.estado]}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total (sin IGV)",
      render: (e) => `${e.moneda === "USD" ? "US$" : "S/"} ${Number(e.total).toFixed(2)}`,
    },
  ];

  const actions: ModuleAction[] = [
    { key: "nueva-compra", label: "Nueva compra", icon: FileInput, tone: "primary", onClick: () => setView({ mode: "entrada" }) },
  ];

  const vistaActions: ModuleAction[] = onCambiarVista
    ? [
        { key: "compras", label: "Compras", icon: ShoppingCart, active: vista === "compras", onClick: () => onCambiarVista("compras") },
        { key: "proveedores", label: "Proveedores", icon: Truck, active: vista === "proveedores", onClick: () => onCambiarVista("proveedores") },
      ]
    : [];



  const comprasFiltradas = compras.filter((compra) => {
    if (searchTerm.trim()) {
      const termino = searchTerm.trim().toLowerCase();
      const coincide = [compra.proveedor_nombre, compra.numero_factura_proveedor, String(compra.numero)]
        .some((campo) => campo?.toLowerCase().includes(termino));
      if (!coincide) return false;
    }
    if (estadoFiltro !== "Sin seleccionar" && ESTADO_LABEL[compra.estado] !== estadoFiltro) return false;
    
    if (selectedLetter !== "0-9") {
      const inicial = (compra.proveedor_nombre || "").trim().charAt(0).toLowerCase();
      if (inicial !== selectedLetter) return false;
    }
    
    return true;
  });

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

      <FilterSection title="Estado">
        {["Sin seleccionar", ...Object.values(ESTADO_LABEL)].map((estado) => (
          <label key={estado} className={filterStyles.radioLabel}>
            <input
              type="checkbox"
              className={filterStyles.radioInput}
              checked={estadoFiltro === estado}
              onChange={() => setEstadoFiltro(estado)}
            />
            {estado}
          </label>
        ))}
      </FilterSection>
    </>
  );

  if (view.mode === "entrada") {
    return (
      <EntradaForm
        entrada={view.entrada}
        vista={vista}
        onCambiarVista={onCambiarVista}
        onCancel={() => setView({ mode: "list" })}
        onSaved={() => {
          setView({ mode: "list" });
          loadCompras();
        }}
        onDeleted={() => {
          setView({ mode: "list" });
          loadCompras();
        }}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      <FilterLayout
        errorBanner={error ? <p className={fieldStyles.errorBanner}>{error}</p> : null}
        sidebarContent={sidebarContent}
        selectedLetter={selectedLetter}
        onLetterSelect={setSelectedLetter}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por proveedor o N° de factura…"
      >
        <div style={{ padding: "16px", height: "100%", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <ShoppingCart size={24} style={{ color: "var(--accent-color)" }} />
            <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Compras y Entradas</h1>
          </div>
          <DataTable
            data={comprasFiltradas}
            columns={columns}
            onRowClick={abrirCompra}
            emptyMessage={loading ? "Cargando…" : "No hay compras que coincidan con el filtro."}
          />
        </div>
      </FilterLayout>
    </div>
  );
}
