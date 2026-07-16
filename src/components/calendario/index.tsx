"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionsDrawer } from "@/components/ui/ActionsDrawer";
import { buildComercialActions } from "@/components/comercial/comercialActions";
import fieldStyles from "@/components/ui/formFields.module.css";
import { EventoForm } from "./components/EventoForm";
import { CalendarioGrid } from "./components/CalendarioGrid";
import type { EventoCalendario } from "./types";

type View = { mode: "grid" } | { mode: "form"; evento?: EventoCalendario; fechaInicial?: string };

export default function CalendarioModule() {
  const [view, setView] = useState<View>({ mode: "grid" });
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

  const actions = buildComercialActions("calendario", () => setView({ mode: "form" }));

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      <ActionsDrawer actions={actions} />
      {error && <p className={fieldStyles.errorBanner}>{error}</p>}

      {loading ? (
        <p style={{ padding: "8px 0", fontSize: 12, color: "var(--text-secondary)" }}>Cargando…</p>
      ) : (
        <CalendarioGrid
          eventos={eventos}
          onDayClick={(fecha) => setView({ mode: "form", fechaInicial: fecha })}
          onEventoClick={(evento) => setView({ mode: "form", evento })}
        />
      )}

      {view.mode === "form" && (
        <EventoForm
          evento={view.evento}
          fechaInicial={view.fechaInicial}
          onCancel={() => setView({ mode: "grid" })}
          onSaved={() => {
            setView({ mode: "grid" });
            loadEventos();
          }}
          onDeleted={() => {
            setView({ mode: "grid" });
            loadEventos();
          }}
        />
      )}
    </div>
  );
}
