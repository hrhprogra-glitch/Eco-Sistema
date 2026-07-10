"use client";

import { useEffect, useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { getApp } from "@/components/lib/apps";
import { ContabilidadTabs } from "./components/ContabilidadTabs";
import { ContabilidadResumen } from "./components/ContabilidadResumen";
import { PlanCuentasList } from "./components/PlanCuentasList";
import { CuentaForm } from "./components/CuentaForm";
import { LibroDiarioList } from "./components/LibroDiarioList";
import { AsientoForm } from "./components/AsientoForm";
import { AsientoDetail } from "./components/AsientoDetail";
import { LibroMayor } from "./components/LibroMayor";
import { BalanceComprobacion } from "./components/BalanceComprobacion";
import type { AsientoContable, ContabilidadVista, CuentaContable, TipoCuenta } from "./types";

const app = getApp("contabilidad")!;

type SubVistaCuentas = "lista" | "form";
type SubVistaDiario = "lista" | "form" | "detalle";

export default function ContabilidadModule() {
  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [asientos, setAsientos] = useState<AsientoContable[]>([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState<ContabilidadVista>("resumen");

  const [subVistaCuentas, setSubVistaCuentas] = useState<SubVistaCuentas>("lista");
  const [cuentaEditando, setCuentaEditando] = useState<CuentaContable | undefined>(undefined);

  const [subVistaDiario, setSubVistaDiario] = useState<SubVistaDiario>("lista");
  const [asientoSeleccionadoId, setAsientoSeleccionadoId] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [cuentasRes, asientosRes] = await Promise.all([
      fetch("/api/contabilidad/cuentas"),
      fetch("/api/contabilidad/asientos"),
    ]);
    if (cuentasRes.ok) setCuentas(await cuentasRes.json());
    if (asientosRes.ok) setAsientos(await asientosRes.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const asientoSeleccionado = asientos.find((a) => a.id === asientoSeleccionadoId) ?? null;

  const irADiario = (asiento?: AsientoContable) => {
    setVista("diario");
    if (asiento) {
      setAsientoSeleccionadoId(asiento.id);
      setSubVistaDiario("detalle");
    } else {
      setSubVistaDiario("lista");
    }
  };

  // --- Plan de cuentas ---
  const handleSaveCuenta = async (data: { codigo: string; nombre: string; tipo: TipoCuenta }) => {
    const url = cuentaEditando ? `/api/contabilidad/cuentas/${cuentaEditando.id}` : "/api/contabilidad/cuentas";
    const res = await fetch(url, {
      method: cuentaEditando ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) return body.error || "No se pudo guardar la cuenta";
    await fetchAll();
    setSubVistaCuentas("lista");
    setCuentaEditando(undefined);
  };

  const handleDeleteCuenta = async (id: string) => {
    if (!confirm("¿Eliminar esta cuenta del plan contable?")) return;
    const res = await fetch(`/api/contabilidad/cuentas/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchAll();
    } else {
      const body = await res.json();
      alert(body.error || "No se pudo eliminar la cuenta");
    }
  };

  // --- Libro diario ---
  const handleSaveAsiento = async (data: {
    fecha: string;
    descripcion: string;
    lineas: { cuenta_id: string; debe: number; haber: number; descripcion: string | null }[];
  }) => {
    const res = await fetch("/api/contabilidad/asientos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) return body.error || "No se pudo guardar el asiento";
    await fetchAll();
    setAsientoSeleccionadoId(body.id);
    setSubVistaDiario("detalle");
  };

  const handleConfirmAsiento = async () => {
    if (!asientoSeleccionado) return;
    const res = await fetch(`/api/contabilidad/asientos/${asientoSeleccionado.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "confirmado" }),
    });
    if (res.ok) {
      await fetchAll();
    } else {
      const body = await res.json();
      alert(body.error || "No se pudo confirmar el asiento");
    }
  };

  const handleDeleteAsiento = async () => {
    if (!asientoSeleccionado) return;
    if (!confirm("¿Eliminar este asiento en borrador?")) return;
    const res = await fetch(`/api/contabilidad/asientos/${asientoSeleccionado.id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchAll();
      setSubVistaDiario("lista");
      setAsientoSeleccionadoId(null);
    } else {
      const body = await res.json();
      alert(body.error || "No se pudo eliminar el asiento");
    }
  };

  const renderContenido = () => {
    if (loading) {
      return (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>Cargando contabilidad...</div>
      );
    }

    switch (vista) {
      case "resumen":
        return <ContabilidadResumen cuentas={cuentas} asientos={asientos} onVerAsiento={irADiario} onVerDiario={() => irADiario()} />;

      case "plan_cuentas":
        return subVistaCuentas === "form" ? (
          <CuentaForm
            cuenta={cuentaEditando}
            onSave={handleSaveCuenta}
            onCancel={() => {
              setSubVistaCuentas("lista");
              setCuentaEditando(undefined);
            }}
          />
        ) : (
          <PlanCuentasList
            cuentas={cuentas}
            onCreate={() => {
              setCuentaEditando(undefined);
              setSubVistaCuentas("form");
            }}
            onSelect={(c) => {
              setCuentaEditando(c);
              setSubVistaCuentas("form");
            }}
            onDelete={handleDeleteCuenta}
          />
        );

      case "diario":
        if (subVistaDiario === "form") {
          return <AsientoForm cuentas={cuentas} onSave={handleSaveAsiento} onCancel={() => setSubVistaDiario("lista")} />;
        }
        if (subVistaDiario === "detalle" && asientoSeleccionado) {
          return (
            <AsientoDetail
              asiento={asientoSeleccionado}
              onBack={() => setSubVistaDiario("lista")}
              onConfirm={handleConfirmAsiento}
              onDelete={handleDeleteAsiento}
            />
          );
        }
        return (
          <LibroDiarioList
            asientos={asientos}
            onCreate={() => setSubVistaDiario("form")}
            onSelect={(a) => {
              setAsientoSeleccionadoId(a.id);
              setSubVistaDiario("detalle");
            }}
          />
        );

      case "mayor":
        return <LibroMayor cuentas={cuentas} asientos={asientos} />;

      case "balance":
        return <BalanceComprobacion cuentas={cuentas} asientos={asientos} />;
    }
  };

  return (
    <ModuleLayout app={app}>
      <ContabilidadTabs
        vista={vista}
        onChange={(v) => {
          setVista(v);
          setSubVistaCuentas("lista");
          setSubVistaDiario("lista");
        }}
      />
      {renderContenido()}
    </ModuleLayout>
  );
}
