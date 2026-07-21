"use client";

import { useCallback, useEffect, useState } from "react";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import { ModuleActions } from "@/components/ui/ModuleActions";
import { buildComercialActions } from "@/components/comercial/comercialActions";
import fieldStyles from "@/components/ui/formFields.module.css";
import { EventoForm } from "./components/EventoForm";
import { CalendarioGrid } from "./components/CalendarioGrid";
import type { EventoCalendario } from "./types";
import { Calendar } from "lucide-react";

type View = { mode: "grid" } | { mode: "form"; evento?: EventoCalendario; fechaInicial?: string };

export default function CalendarioModule() {
  const [view, setView] = useState<View>({ mode: "grid" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("0-9");
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

  const sidebarContent = (
    <FilterSection title="Acciones">
      <ModuleActions actions={actions} variant="sidebar" />
    </FilterSection>
  );

  const eventosFiltrados = eventos.filter((e) => {
    if (searchTerm) {
      if (!e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !(e.descripcion && e.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }
    }
    if (selectedLetter !== "0-9") {
      const inicial = e.titulo.trim().charAt(0).toLowerCase();
      if (inicial !== selectedLetter) return false;
    }
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      <FilterLayout
        errorBanner={error ? <p className={fieldStyles.errorBanner}>{error}</p> : null}
        sidebarContent={sidebarContent}
        selectedLetter={selectedLetter}
        onLetterSelect={setSelectedLetter}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar eventos..."
      >
        <div style={{ padding: "16px", height: "100%", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexShrink: 0 }}>
            <Calendar size={24} style={{ color: "var(--accent-color)" }} />
            <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Calendario</h1>
          </div>

          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
            {loading ? (
              <p style={{ padding: "8px 0", fontSize: 12, color: "var(--text-secondary)" }}>Cargando…</p>
            ) : (
              <CalendarioGrid
                eventos={eventosFiltrados}
                onDayClick={(fecha) => setView({ mode: "form", fechaInicial: fecha })}
                onEventoClick={(evento) => setView({ mode: "form", evento })}
              />
            )}
          </div>
        </div>
      </FilterLayout>

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
