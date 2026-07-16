"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ModuleActions } from "@/components/ui/ModuleActions";
import { buildComercialActions } from "@/components/comercial/comercialActions";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import filterStyles from "@/components/ui/FilterLayout.module.css";
import fieldStyles from "@/components/ui/formFields.module.css";
import { OportunidadForm, ETAPA_LABEL } from "./components/OportunidadForm";
import { OportunidadKanban } from "./components/OportunidadKanban";
import type { EtapaOportunidad, Oportunidad } from "./types";

type View = { mode: "list" } | { mode: "form"; oportunidad?: Oportunidad };

const ETAPAS: EtapaOportunidad[] = ["nuevo", "calificado", "propuesta", "ganado", "perdido"];
const DIAS_MS = 24 * 60 * 60 * 1000;

export default function CrmModule() {
  const [view, setView] = useState<View>({ mode: "list" });
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [etapaFiltro, setEtapaFiltro] = useState("Sin seleccionar");
  const [recienteFiltro, setRecienteFiltro] = useState("todos");
  const [selectedLetter, setSelectedLetter] = useState("0-9");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOportunidades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/oportunidades");
      if (!res.ok) throw new Error("No se pudieron cargar las oportunidades.");
      setOportunidades(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOportunidades();
  }, [loadOportunidades]);

  const oportunidadesFiltradas = useMemo(() => {
    return oportunidades.filter((o) => {
      if (busqueda.trim()) {
        const termino = busqueda.trim().toLowerCase();
        const coincide = o.titulo.toLowerCase().includes(termino) || (o.contacto_nombre ?? "").toLowerCase().includes(termino);
        if (!coincide) return false;
      }

      if (selectedLetter !== "0-9") {
        const inicial = (o.contacto_nombre ?? "").trim().charAt(0).toLowerCase();
        if (inicial !== selectedLetter) return false;
      }

      if (etapaFiltro !== "Sin seleccionar" && ETAPA_LABEL[o.etapa] !== etapaFiltro) return false;

      if (recienteFiltro !== "todos") {
        const antiguedadMs = Date.now() - new Date(o.created_at).getTime();
        if (recienteFiltro === "hoy" && antiguedadMs > DIAS_MS) return false;
        if (recienteFiltro === "semana" && antiguedadMs > DIAS_MS * 7) return false;
        if (recienteFiltro === "mes" && antiguedadMs > DIAS_MS * 30) return false;
      }

      return true;
    });
  }, [oportunidades, busqueda, etapaFiltro, recienteFiltro, selectedLetter]);

  async function handleEtapaChange(oportunidad: Oportunidad, nuevaEtapa: EtapaOportunidad) {
    const anterior = oportunidad.etapa;
    setOportunidades((prev) =>
      prev.map((o) => (o.id === oportunidad.id ? { ...o, etapa: nuevaEtapa } : o))
    );
    try {
      const payload = {
        titulo: oportunidad.titulo,
        contacto_id: oportunidad.contacto_id,
        etapa: nuevaEtapa,
        monto_estimado: oportunidad.monto_estimado,
        notas: oportunidad.notas,
      };
      const res = await fetch(`/api/oportunidades/${oportunidad.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("No se pudo mover la oportunidad.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
      setOportunidades((prev) =>
        prev.map((o) => (o.id === oportunidad.id ? { ...o, etapa: anterior } : o))
      );
    }
  }

  const actions = buildComercialActions("crm", () => setView({ mode: "form" }));

  const sidebarContent = (
    <>
      <FilterSection title="Acciones">
        <ModuleActions actions={actions} variant="sidebar" />
      </FilterSection>

      <FilterSection title="Estados">
        {["Sin seleccionar", ...ETAPAS.map((e) => ETAPA_LABEL[e])].map((estado) => (
          <label key={estado} className={filterStyles.radioLabel}>
            <input
              type="checkbox"
              className={filterStyles.radioInput}
              checked={etapaFiltro === estado}
              onChange={() => setEtapaFiltro(estado)}
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
              name="crm-reciente"
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
      {loading && <p style={{ padding: "8px 0", fontSize: 12, color: "var(--text-secondary)" }}>Cargando…</p>}

      <FilterLayout
        sidebarContent={sidebarContent}
        selectedLetter={selectedLetter}
        onLetterSelect={setSelectedLetter}
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        searchPlaceholder="Título o cliente…"
      >
        <OportunidadKanban
          oportunidades={oportunidadesFiltradas}
          onCardClick={(oportunidad) => setView({ mode: "form", oportunidad })}
          onEtapaChange={handleEtapaChange}
        />
      </FilterLayout>

      {view.mode === "form" && (
        <OportunidadForm
          oportunidad={view.oportunidad}
          onCancel={() => setView({ mode: "list" })}
          onSaved={() => {
            setView({ mode: "list" });
            loadOportunidades();
          }}
          onDeleted={() => {
            setView({ mode: "list" });
            loadOportunidades();
          }}
        />
      )}
    </div>
  );
}
