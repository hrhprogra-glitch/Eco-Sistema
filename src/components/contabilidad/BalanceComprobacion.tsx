"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { Scale, CheckCircle2, AlertTriangle } from "lucide-react";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { TipoCuenta } from "./types";
import type { BalanceComprobacionResponse } from "./librosTypes";

function primerDiaDelMes(): string {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);
}

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatMonto(n: number): string {
  const signo = n < 0 ? "-" : "";
  return `${signo}$${Math.abs(n).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const TIPO_LABEL: Record<TipoCuenta, string> = {
  activo: "Activo",
  pasivo: "Pasivo",
  patrimonio: "Patrimonio",
  ingreso: "Ingreso",
  gasto: "Gasto",
};

const th: CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.02em",
  color: "var(--text-secondary)",
  borderBottom: "1px solid var(--border-color)",
};
const thRight: CSSProperties = { ...th, textAlign: "right" };
const td: CSSProperties = { padding: "8px 12px", fontSize: 14, borderBottom: "1px solid var(--border-color)" };
const tdRight: CSSProperties = { ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" };

export default function BalanceComprobacion() {
  const [desde, setDesde] = useState(primerDiaDelMes());
  const [hasta, setHasta] = useState(hoyISO());
  const [data, setData] = useState<BalanceComprobacionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ desde, hasta });
      const res = await fetch(`/api/contabilidad/balance-comprobacion?${params.toString()}`);
      if (!res.ok) throw new Error("No se pudo cargar el balance de comprobación.");
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, [desde, hasta]);

  useEffect(() => {
    load();
  }, [load]);

  const cuadra = data ? Math.abs(data.totales.total_debe - data.totales.total_haber) < 0.005 : true;

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 20, height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Scale size={22} style={{ color: "var(--accent-text)" }} />
        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Balance de Comprobación</h1>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
        <label className={fieldStyles.field} style={{ minWidth: 180 }}>
          <span className={fieldStyles.label}>Desde</span>
          <input
            type="date"
            className={fieldStyles.input}
            value={desde}
            max={hasta}
            onChange={(e) => setDesde(e.target.value)}
          />
        </label>
        <label className={fieldStyles.field} style={{ minWidth: 180 }}>
          <span className={fieldStyles.label}>Hasta</span>
          <input
            type="date"
            className={fieldStyles.input}
            value={hasta}
            min={desde}
            onChange={(e) => setHasta(e.target.value)}
          />
        </label>
      </div>

      {error && <p className={fieldStyles.errorBanner}>{error}</p>}

      {loading && !data ? (
        <p style={{ color: "var(--text-secondary)" }}>Cargando balance de comprobación...</p>
      ) : data ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Código</th>
              <th style={th}>Cuenta</th>
              <th style={th}>Tipo</th>
              <th style={thRight}>Debe</th>
              <th style={thRight}>Haber</th>
              <th style={thRight}>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {data.filas.length === 0 ? (
              <tr>
                <td style={td} colSpan={6}>
                  <span style={{ color: "var(--text-secondary)" }}>Sin cuentas con movimientos confirmados en el período.</span>
                </td>
              </tr>
            ) : (
              data.filas.map((f) => (
                <tr key={f.cuenta_id}>
                  <td style={td}>{f.codigo}</td>
                  <td style={td}>{f.nombre}</td>
                  <td style={td}>{TIPO_LABEL[f.tipo]}</td>
                  <td style={tdRight}>{formatMonto(f.total_debe)}</td>
                  <td style={tdRight}>{formatMonto(f.total_haber)}</td>
                  <td style={{ ...tdRight, fontWeight: 600 }}>{formatMonto(f.saldo)}</td>
                </tr>
              ))
            )}
            <tr>
              <td style={{ ...td, fontWeight: 700, borderBottom: "none" }} colSpan={3}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {cuadra ? (
                    <CheckCircle2 size={15} style={{ color: "var(--status-online)" }} />
                  ) : (
                    <AlertTriangle size={15} style={{ color: "var(--status-error)" }} />
                  )}
                  Totales {cuadra ? "(cuadra)" : "(no cuadra)"}
                </span>
              </td>
              <td style={{ ...tdRight, fontWeight: 700, borderBottom: "none" }}>{formatMonto(data.totales.total_debe)}</td>
              <td style={{ ...tdRight, fontWeight: 700, borderBottom: "none" }}>{formatMonto(data.totales.total_haber)}</td>
              <td style={{ ...tdRight, fontWeight: 700, borderBottom: "none" }} />
            </tr>
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
