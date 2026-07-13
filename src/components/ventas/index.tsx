"use client";

import { useCallback, useEffect, useState } from "react";
import { ModuleRibbon, DEFAULT_GROUPS } from "@/components/ui/ModuleRibbon";
import { DataTable, type Column } from "@/components/ui/DataTable";
import fieldStyles from "@/components/ui/formFields.module.css";
import { VentaForm } from "./components/VentaForm";
import type { Venta, VentaEstado } from "./types";

type View = { mode: "list" } | { mode: "form"; venta?: Venta };

const ESTADO_LABEL: Record<VentaEstado, string> = {
  borrador: "Borrador",
  confirmada: "Confirmada",
  facturada: "Facturada",
  cancelada: "Cancelada",
};

export default function VentasModule() {
  const [view, setView] = useState<View>({ mode: "list" });
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVentas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ventas");
      if (!res.ok) throw new Error("No se pudieron cargar las ventas.");
      setVentas(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVentas();
  }, [loadVentas]);

  async function openVenta(venta: Venta) {
    const res = await fetch(`/api/ventas/${venta.id}`);
    if (res.ok) {
      const full = await res.json();
      setView({ mode: "form", venta: { ...venta, ...full } });
    } else {
      setView({ mode: "form", venta });
    }
  }

  const columns: Column<Venta>[] = [
    { key: "numero", header: "N°" },
    { key: "contacto_nombre", header: "Cliente" },
    { key: "estado", header: "Estado", render: (v) => ESTADO_LABEL[v.estado] },
    { key: "total", header: "Total", render: (v) => Number(v.total).toFixed(2) },
    { key: "fecha", header: "Fecha", render: (v) => v.fecha?.slice(0, 10) },
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
        data={ventas}
        columns={columns}
        onRowClick={openVenta}
        emptyMessage={loading ? "Cargando…" : "No hay ventas registradas todavía."}
      />

      {view.mode === "form" && (
        <VentaForm
          venta={view.venta}
          onCancel={() => setView({ mode: "list" })}
          onSaved={() => {
            setView({ mode: "list" });
            loadVentas();
          }}
          onDeleted={() => {
            setView({ mode: "list" });
            loadVentas();
          }}
        />
      )}
    </>
  );
}
