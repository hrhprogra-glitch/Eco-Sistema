"use client";

import { useCallback, useEffect, useState } from "react";
import { FileInput } from "lucide-react";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import filterStyles from "@/components/ui/FilterLayout.module.css";
import fieldStyles from "@/components/ui/formFields.module.css";
import { EntradaForm } from "./EntradaForm";
import type { Entrada } from "../types";

type View = { mode: "list" } | { mode: "entrada"; entrada?: Entrada };

const ESTADO_LABEL: Record<Entrada["estado"], string> = {
  borrador: "Borrador",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
};

export function ComprasList() {
  const [view, setView] = useState<View>({ mode: "list" });
  const [compras, setCompras] = useState<Entrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Sin seleccionar");

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

  const comprasFiltradas = compras.filter((compra) => {
    if (searchTerm.trim()) {
      const termino = searchTerm.trim().toLowerCase();
      const coincide = [compra.proveedor_nombre, compra.numero_factura_proveedor, String(compra.numero)]
        .some((campo) => campo?.toLowerCase().includes(termino));
      if (!coincide) return false;
    }
    if (estadoFiltro !== "Sin seleccionar" && ESTADO_LABEL[compra.estado] !== estadoFiltro) return false;
    return true;
  });

  const sidebarContent = (
    <>
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
      {error && <p className={fieldStyles.errorBanner}>{error}</p>}

      <FilterLayout
        sidebarContent={sidebarContent}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por proveedor o N° de factura…"
      >
        <DataTable
          data={comprasFiltradas}
          columns={columns}
          onRowClick={abrirCompra}
          emptyMessage={loading ? "Cargando…" : "No hay compras que coincidan con el filtro."}
        />
      </FilterLayout>
    </div>
  );
}
