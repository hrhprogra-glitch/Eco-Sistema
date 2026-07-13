"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ModuleRibbon, DEFAULT_GROUPS } from "@/components/ui/ModuleRibbon";
import { DataTable, type Column } from "@/components/ui/DataTable";
import fieldStyles from "@/components/ui/formFields.module.css";
import { OportunidadForm, ETAPA_LABEL } from "./components/OportunidadForm";
import type { EtapaOportunidad, Oportunidad } from "./types";
import styles from "./crm.module.css";

type View = { mode: "list" } | { mode: "form"; oportunidad?: Oportunidad };

const ETAPAS: EtapaOportunidad[] = ["nuevo", "calificado", "propuesta", "ganado", "perdido"];

export default function CrmModule() {
  const [view, setView] = useState<View>({ mode: "list" });
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [etapaFiltro, setEtapaFiltro] = useState<EtapaOportunidad | null>(null);
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

  const oportunidadesFiltradas = useMemo(
    () => (etapaFiltro ? oportunidades.filter((o) => o.etapa === etapaFiltro) : oportunidades),
    [oportunidades, etapaFiltro]
  );

  const columns: Column<Oportunidad>[] = [
    { key: "titulo", header: "Título" },
    { key: "contacto_nombre", header: "Cliente" },
    { key: "etapa", header: "Etapa", render: (o) => ETAPA_LABEL[o.etapa] },
    { key: "monto_estimado", header: "Monto estimado", render: (o) => Number(o.monto_estimado).toFixed(2) },
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
      <div className={styles.etapaFilter}>
        <button
          type="button"
          className={styles.etapaButton}
          data-active={etapaFiltro === null ? "" : undefined}
          onClick={() => setEtapaFiltro(null)}
        >
          Todas
        </button>
        {ETAPAS.map((etapa) => (
          <button
            key={etapa}
            type="button"
            className={styles.etapaButton}
            data-active={etapaFiltro === etapa ? "" : undefined}
            onClick={() => setEtapaFiltro(etapa)}
          >
            {ETAPA_LABEL[etapa]}
          </button>
        ))}
      </div>
      <DataTable
        data={oportunidadesFiltradas}
        columns={columns}
        onRowClick={(oportunidad) => setView({ mode: "form", oportunidad })}
        emptyMessage={loading ? "Cargando…" : "No hay oportunidades cargadas todavía."}
      />

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
    </>
  );
}
