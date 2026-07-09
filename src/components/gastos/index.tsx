"use client";

import { useEffect, useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { getApp } from "@/components/lib/apps";
import { GastosResumen } from "./components/GastosResumen";
import { GastosCatalog } from "./components/GastosCatalog";
import { GastoDetailView } from "./components/GastoDetailView";
import type { Gasto } from "./types";

const app = getApp("gastos")!;

type Vista = "resumen" | "gastos" | "form";

function createEmptyGasto(): Gasto {
  return {
    id: 0,
    concepto: "",
    categoria: "",
    monto: 0,
    fecha: new Date().toISOString().slice(0, 10),
    estado: "pendiente",
    notas: null,
    comprobante_url: null,
    created_at: new Date().toISOString(),
  };
}

export default function GastosModule() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState<Vista>("resumen");
  const [activeGasto, setActiveGasto] = useState<Gasto | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchGastos = async () => {
    setLoading(true);
    const res = await fetch("/api/gastos");
    if (res.ok) {
      setGastos(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGastos();
  }, []);

  function handleNuevo() {
    setActiveGasto(createEmptyGasto());
    setIsCreating(true);
    setVista("form");
  }

  function handleEditar(gasto: Gasto) {
    setActiveGasto(gasto);
    setIsCreating(false);
    setVista("form");
  }

  function handleVolver() {
    setActiveGasto(null);
    setIsCreating(false);
    setVista("gastos");
  }

  async function handleGuardar(gasto: Gasto) {
    setIsSaving(true);
    const res = isCreating
      ? await fetch("/api/gastos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(gasto),
        })
      : await fetch(`/api/gastos/${gasto.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(gasto),
        });

    if (res.ok) {
      await fetchGastos();
      handleVolver();
    }
    setIsSaving(false);
  }

  async function handleEliminar(gasto: Gasto) {
    setIsSaving(true);
    const res = await fetch(`/api/gastos/${gasto.id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchGastos();
      handleVolver();
    }
    setIsSaving(false);
  }

  return (
    <ModuleLayout
      app={app}
      topbarContent={
        <>
          <button
            className={`topbar_navButton ${vista === "resumen" ? "topbar_active" : ""}`}
            onClick={() => setVista("resumen")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
              color: vista === "resumen" ? "var(--text-primary)" : "var(--text-secondary)",
            }}
          >
            Resumen
          </button>
          <button
            className={`topbar_navButton ${vista === "gastos" || vista === "form" ? "topbar_active" : ""}`}
            onClick={() => setVista("gastos")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
              color: vista === "gastos" || vista === "form" ? "var(--text-primary)" : "var(--text-secondary)",
              marginLeft: "16px",
            }}
          >
            Gastos
          </button>
        </>
      }
    >
      {loading ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)" }}>
          Cargando gastos...
        </div>
      ) : vista === "resumen" ? (
        <GastosResumen gastos={gastos} onVerGastos={() => setVista("gastos")} />
      ) : vista === "gastos" ? (
        <GastosCatalog gastos={gastos} onCreate={handleNuevo} onEdit={handleEditar} />
      ) : (
        <GastoDetailView
          gasto={activeGasto!}
          isNew={isCreating}
          isSaving={isSaving}
          onBack={handleVolver}
          onSave={handleGuardar}
          onDelete={handleEliminar}
        />
      )}
    </ModuleLayout>
  );
}
