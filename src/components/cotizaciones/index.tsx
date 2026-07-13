"use client";

import { useCallback, useEffect, useState } from "react";
import { ModuleRibbon, DEFAULT_GROUPS } from "@/components/ui/ModuleRibbon";
import { DataTable, type Column } from "@/components/ui/DataTable";
import fieldStyles from "@/components/ui/formFields.module.css";
import { CotizacionForm } from "./components/CotizacionForm";
import type { Cotizacion, EstadoCotizacion } from "./types";

type View = { mode: "list" } | { mode: "form"; cotizacion?: Cotizacion };

const ESTADO_LABEL: Record<EstadoCotizacion, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
};

export default function CotizacionesModule() {
  const [view, setView] = useState<View>({ mode: "list" });
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    { key: "estado", header: "Estado", render: (c) => ESTADO_LABEL[c.estado] },
    { key: "total", header: "Total", render: (c) => Number(c.total).toFixed(2) },
    { key: "fecha", header: "Fecha", render: (c) => c.fecha?.slice(0, 10) },
  ];

  const customRibbon = [
    {
      ...DEFAULT_GROUPS[0],
      buttons: DEFAULT_GROUPS[0].buttons
        .filter((btn) => btn.key === "nuevo")
        .map((btn) => ({ ...btn, onClick: () => setView({ mode: "form" }) })),
    },
  ];

  return (
    <>
      <ModuleRibbon groups={customRibbon} />
      {error && <p className={fieldStyles.errorBanner}>{error}</p>}
      <DataTable
        data={cotizaciones}
        columns={columns}
        onRowClick={openCotizacion}
        emptyMessage={loading ? "Cargando…" : "No hay cotizaciones registradas todavía."}
      />

      {view.mode === "form" && (
        <CotizacionForm
          cotizacion={view.cotizacion}
          onCancel={() => setView({ mode: "list" })}
          onSaved={() => {
            setView({ mode: "list" });
            loadCotizaciones();
          }}
          onDeleted={() => {
            setView({ mode: "list" });
            loadCotizaciones();
          }}
        />
      )}
    </>
  );
}
