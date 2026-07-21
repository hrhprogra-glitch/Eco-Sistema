"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { ModuleActions } from "@/components/ui/ModuleActions";
import { buildComercialActions } from "@/components/comercial/comercialActions";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import filterStyles from "@/components/ui/FilterLayout.module.css";
import fieldStyles from "@/components/ui/formFields.module.css";
import { CotizacionForm } from "./components/CotizacionForm";
import type { Cotizacion, EstadoCotizacion } from "./types";
import estadoStyles from "./EstadoBadge.module.css";

type View = { mode: "list" } | { mode: "form"; cotizacion?: Cotizacion };

const ESTADO_LABEL: Record<EstadoCotizacion, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
  confirmada: "Confirmada (venta)",
  cancelada: "Cancelada",
};

const ESTADOS: EstadoCotizacion[] = ["borrador", "enviada", "aceptada", "rechazada", "confirmada", "cancelada"];
const DIAS_MS = 24 * 60 * 60 * 1000;

// Resalta en la tabla si ya se confirmó como venta (verde) o si quedó descartada (rojo);
// el resto de los estados -todavía en trámite, sin definirse- van neutros.
const ESTADO_TONO: Record<EstadoCotizacion, "confirmada" | "negativo" | "neutro"> = {
  borrador: "neutro",
  enviada: "neutro",
  aceptada: "neutro",
  rechazada: "negativo",
  cancelada: "negativo",
  confirmada: "confirmada",
};

function EstadoBadge({ estado }: { estado: EstadoCotizacion }) {
  return (
    <span className={estadoStyles.badge} data-tono={ESTADO_TONO[estado]}>
      {ESTADO_LABEL[estado]}
    </span>
  );
}

export default function CotizacionesModule() {
  const [view, setView] = useState<View>({ mode: "list" });
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Sin seleccionar");
  const [recienteFiltro, setRecienteFiltro] = useState("todos");
  const [selectedLetter, setSelectedLetter] = useState("0-9");

  const loadCotizaciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cotizaciones");
      if (!res.ok) throw new Error("No se pudieron cargar las cotizaciones.");
      setCotizaciones(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCotizaciones();
  }, [loadCotizaciones]);

  async function openCotizacion(cotizacion: Cotizacion) {
    const res = await fetch(`/api/cotizaciones/${cotizacion.id}`);
    if (res.ok) {
      const full = await res.json();
      setView({ mode: "form", cotizacion: { ...cotizacion, ...full } });
    } else {
      setView({ mode: "form", cotizacion });
    }
  }

  const columns: Column<Cotizacion>[] = [
    { key: "numero", header: "N°" },
    { key: "contacto_nombre", header: "Cliente" },
    { key: "estado", header: "Estado", render: (c) => <EstadoBadge estado={c.estado} /> },
    { key: "total", header: "Total", render: (c) => `${c.moneda === "USD" ? "U$" : "S/"} ${Number(c.total).toFixed(2)}` },
    { key: "fecha", header: "Fecha", render: (c) => c.fecha?.slice(0, 10) },
  ];

  const actions = buildComercialActions("cotizaciones", () => setView({ mode: "form" }));

  const cotizacionesFiltradas = cotizaciones.filter((cotizacion) => {
    if (searchTerm.trim()) {
      const termino = searchTerm.trim().toLowerCase();
      const coincide = [cotizacion.contacto_nombre, String(cotizacion.numero)]
        .some((campo) => campo?.toLowerCase().includes(termino));
      if (!coincide) return false;
    }

    if (selectedLetter !== "0-9") {
      const inicial = (cotizacion.contacto_nombre ?? "").trim().charAt(0).toLowerCase();
      if (inicial !== selectedLetter) return false;
    }

    if (estadoFiltro !== "Sin seleccionar" && ESTADO_LABEL[cotizacion.estado] !== estadoFiltro) {
      return false;
    }

    if (recienteFiltro !== "todos") {
      const antiguedadMs = Date.now() - new Date(cotizacion.created_at).getTime();
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
              name="cotizaciones-reciente"
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

  if (view.mode === "form") {
    return (
      <CotizacionForm
        cotizacion={view.cotizacion}
        onCancel={() => {
          setView({ mode: "list" });
          // Confirmar/revertir venta cambian el estado directo en el servidor sin pasar
          // por "Guardar y cerrar", así que hay que refrescar la lista igual al salir por
          // acá -si no, se puede ver un estado viejo hasta la próxima recarga manual-.
          loadCotizaciones();
        }}
        onSaved={() => {
          setView({ mode: "list" });
          loadCotizaciones();
        }}
        onDeleted={() => {
          setView({ mode: "list" });
          loadCotizaciones();
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
        searchPlaceholder="Buscar cotización…"
      >
        <div style={{ padding: "16px", height: "100%", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <FileText size={24} style={{ color: "var(--accent-color)" }} />
            <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Cotizaciones</h1>
          </div>
          <DataTable
            data={cotizacionesFiltradas}
            columns={columns}
            onRowClick={openCotizacion}
            emptyMessage={loading ? "Cargando…" : "No hay cotizaciones que coincidan con el filtro."}
          />
        </div>
      </FilterLayout>
    </div>
  );
}
