"use client";

import { useCallback, useEffect, useState } from "react";
import { Receipt, ArrowRightLeft } from "lucide-react";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import filterStyles from "@/components/ui/FilterLayout.module.css";
import fieldStyles from "@/components/ui/formFields.module.css";
import { FacturaForm } from "./components/FacturaForm";
import { ConvertirCotizacionModal } from "./components/ConvertirCotizacionModal";
import type { Factura, EstadoFactura } from "./types";
import styles from "./index.module.css";

type View = { mode: "list" } | { mode: "form"; factura?: Factura };

const ESTADO_LABEL: Record<EstadoFactura, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  pagada: "Pagada",
  vencida: "Vencida",
};
const ESTADO_COLOR: Record<EstadoFactura, string> = {
  borrador: "var(--status-offline)",
  enviada: "var(--status-pending)",
  pagada: "var(--status-online)",
  vencida: "var(--status-error)",
};
const ESTADOS: EstadoFactura[] = ["borrador", "enviada", "pagada", "vencida"];
const DIAS_MS = 24 * 60 * 60 * 1000;

export default function FacturacionModule() {
  const [view, setView] = useState<View>({ mode: "list" });
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarConvertir, setMostrarConvertir] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Sin seleccionar");
  const [recienteFiltro, setRecienteFiltro] = useState("todos");
  const [selectedLetter, setSelectedLetter] = useState("0-9");

  const loadFacturas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/facturas");
      if (!res.ok) throw new Error("No se pudieron cargar las facturas.");
      setFacturas(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFacturas();
  }, [loadFacturas]);

  async function openFactura(factura: Factura) {
    const res = await fetch(`/api/facturas/${factura.id}`);
    if (res.ok) {
      const full = await res.json();
      setView({ mode: "form", factura: { ...factura, ...full } });
    } else {
      setView({ mode: "form", factura });
    }
  }

  const columns: Column<Factura>[] = [
    { key: "numero", header: "N°" },
    { key: "contacto_nombre", header: "Cliente" },
    {
      key: "estado",
      header: "Estado",
      render: (f) => (
        <span className={styles.estadoPill} style={{ color: ESTADO_COLOR[f.estado] }}>
          {ESTADO_LABEL[f.estado]}
        </span>
      ),
    },
    { key: "total", header: "Total", render: (f) => Number(f.total).toFixed(2) },
    { key: "fecha", header: "Fecha", render: (f) => f.fecha?.slice(0, 10) },
  ];

  const actions: ModuleAction[] = [
    { key: "nueva-factura", label: "Nueva factura", icon: Receipt, tone: "primary", onClick: () => setView({ mode: "form" }) },
    { key: "convertir-cotizacion", label: "Convertir cotización", icon: ArrowRightLeft, onClick: () => setMostrarConvertir(true) },
  ];

  const facturasFiltradas = facturas.filter((factura) => {
    if (searchTerm.trim()) {
      const termino = searchTerm.trim().toLowerCase();
      const coincide = [factura.contacto_nombre, String(factura.numero)]
        .some((campo) => campo?.toLowerCase().includes(termino));
      if (!coincide) return false;
    }

    if (selectedLetter !== "0-9") {
      const inicial = (factura.contacto_nombre ?? "").trim().charAt(0).toLowerCase();
      if (inicial !== selectedLetter) return false;
    }

    if (estadoFiltro !== "Sin seleccionar" && ESTADO_LABEL[factura.estado] !== estadoFiltro) {
      return false;
    }

    if (recienteFiltro !== "todos") {
      const antiguedadMs = Date.now() - new Date(factura.fecha).getTime();
      if (recienteFiltro === "hoy" && antiguedadMs > DIAS_MS) return false;
      if (recienteFiltro === "semana" && antiguedadMs > DIAS_MS * 7) return false;
      if (recienteFiltro === "mes" && antiguedadMs > DIAS_MS * 30) return false;
    }

    return true;
  });

  const sidebarContent = (
    <>
      <FilterSection title="Acciones">
        <ModuleActions actions={actions} variant="sidebar" />
      </FilterSection>

      <FilterSection title="Estados">
        {["Sin seleccionar", ...ESTADOS.map((e) => ESTADO_LABEL[e])].map((estado) => (
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

      <FilterSection title="Recientes">
        {[
          { id: "todos", label: "Todos" },
          { id: "hoy", label: "Creados hoy" },
          { id: "semana", label: "La última semana" },
          { id: "mes", label: "El último mes" },
        ].map((opcion) => (
          <label key={opcion.id} className={filterStyles.radioLabel}>
            <input
              type="radio"
              name="facturacion-reciente"
              className={filterStyles.radioInput}
              checked={recienteFiltro === opcion.id}
              onChange={() => setRecienteFiltro(opcion.id)}
            />
            {opcion.label}
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
        searchPlaceholder="Buscar factura…"
      >
        <DataTable
          data={facturasFiltradas}
          columns={columns}
          onRowClick={openFactura}
          emptyMessage={loading ? "Cargando…" : "No hay facturas que coincidan con el filtro."}
        />
      </FilterLayout>

      {view.mode === "form" && (
        <FacturaForm
          factura={view.factura}
          onCancel={() => setView({ mode: "list" })}
          onSaved={() => {
            setView({ mode: "list" });
            loadFacturas();
          }}
          onDeleted={() => {
            setView({ mode: "list" });
            loadFacturas();
          }}
        />
      )}

      {mostrarConvertir && (
        <ConvertirCotizacionModal
          facturasExistentes={facturas}
          onClose={() => setMostrarConvertir(false)}
          onConverted={(factura) => {
            setMostrarConvertir(false);
            setView({ mode: "form", factura });
            loadFacturas();
          }}
        />
      )}
    </div>
  );
}
