"use client";

import { useCallback, useEffect, useState } from "react";
import { ModuleRibbon, DEFAULT_GROUPS } from "@/components/ui/ModuleRibbon";
import { DataTable, type Column } from "@/components/ui/DataTable";
import fieldStyles from "@/components/ui/formFields.module.css";
import { EventoForm } from "./components/EventoForm";
import type { EstadoEvento, EventoCalendario, TipoEvento } from "./types";

type View = { mode: "list" } | { mode: "form"; evento?: EventoCalendario };

const TIPO_LABEL: Record<TipoEvento, string> = {
  nota: "Nota",
  recordatorio: "Recordatorio",
  mantenimiento: "Mantenimiento",
  visita: "Visita",
  obra: "Obra",
};

const ESTADO_LABEL: Record<EstadoEvento, string> = {
  pendiente: "Pendiente",
  completado: "Completado",
  cancelado: "Cancelado",
};

export default function CalendarioModule() {
  const [view, setView] = useState<View>({ mode: "list" });
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEventos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/calendario");
      if (!res.ok) throw new Error("No se pudieron cargar los eventos.");
      setEventos(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEventos();
  }, [loadEventos]);

  const columns: Column<EventoCalendario>[] = [
    { key: "titulo", header: "Título" },
    { key: "fecha", header: "Fecha", render: (e) => e.fecha?.slice(0, 10) },
    { key: "tipo", header: "Tipo", render: (e) => TIPO_LABEL[e.tipo] },
    { key: "estado", header: "Estado", render: (e) => ESTADO_LABEL[e.estado] },
    { key: "proyecto_nombre", header: "Proyecto" },
    { key: "piscina_nombre", header: "Piscina" },
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
        data={eventos}
        columns={columns}
        onRowClick={(evento) => setView({ mode: "form", evento })}
        emptyMessage={loading ? "Cargando…" : "No hay eventos cargados todavía."}
      />

      {view.mode === "form" && (
        <EventoForm
          evento={view.evento}
          onCancel={() => setView({ mode: "list" })}
          onSaved={() => {
            setView({ mode: "list" });
            loadEventos();
          }}
          onDeleted={() => {
            setView({ mode: "list" });
            loadEventos();
          }}
        />
      )}
    </>
  );
}
