"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { EstadoResultados as EstadoResultadosData } from "./types";

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

export default function EstadoResultados() {
  const [desde, setDesde] = useState(primerDiaDelMes());
  const [hasta, setHasta] = useState(hoyISO());
  const [data, setData] = useState<EstadoResultadosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ desde, hasta });
      const res = await fetch(`/api/contabilidad/estado-resultados?${params.toString()}`);
      if (!res.ok) throw new Error("No se pudo cargar el estado de resultados.");
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

  const utilidad = data?.utilidadNeta ?? 0;
  const esPositiva = utilidad >= 0;

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 20, height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <TrendingUp size={22} style={{ color: "var(--accent-text)" }} />
        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Estado de Resultados</h1>
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
        <p style={{ color: "var(--text-secondary)" }}>Cargando estado de resultados...</p>
      ) : data ? (
        <>
          <section>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px" }}>Ingresos</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Código</th>
                  <th style={th}>Cuenta</th>
                  <th style={thRight}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {data.ingresos.length === 0 ? (
                  <tr>
                    <td style={td} colSpan={3}>
                      <span style={{ color: "var(--text-secondary)" }}>Sin movimientos confirmados en el período.</span>
                    </td>
                  </tr>
                ) : (
                  data.ingresos.map((l) => (
                    <tr key={l.cuenta_id}>
                      <td style={td}>{l.codigo}</td>
                      <td style={td}>{l.nombre}</td>
                      <td style={tdRight}>{formatMonto(l.monto)}</td>
                    </tr>
                  ))
                )}
                <tr>
                  <td style={{ ...td, fontWeight: 700, borderBottom: "none" }} colSpan={2}>
                    Total Ingresos
                  </td>
                  <td style={{ ...tdRight, fontWeight: 700, borderBottom: "none", color: "var(--status-online)" }}>
                    {formatMonto(data.totalIngresos)}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px" }}>Gastos</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Código</th>
                  <th style={th}>Cuenta</th>
                  <th style={thRight}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {data.gastos.length === 0 ? (
                  <tr>
                    <td style={td} colSpan={3}>
                      <span style={{ color: "var(--text-secondary)" }}>Sin movimientos confirmados en el período.</span>
                    </td>
                  </tr>
                ) : (
                  data.gastos.map((l) => (
                    <tr key={l.cuenta_id}>
                      <td style={td}>{l.codigo}</td>
                      <td style={td}>{l.nombre}</td>
                      <td style={tdRight}>{formatMonto(l.monto)}</td>
                    </tr>
                  ))
                )}
                <tr>
                  <td style={{ ...td, fontWeight: 700, borderBottom: "none" }} colSpan={2}>
                    Total Gastos
                  </td>
                  <td style={{ ...tdRight, fontWeight: 700, borderBottom: "none", color: "var(--status-error)" }}>
                    {formatMonto(data.totalGastos)}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 16px",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius)",
              background: "var(--bg-surface)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 15 }}>
              {esPositiva ? (
                <TrendingUp size={18} style={{ color: "var(--status-online)" }} />
              ) : (
                <TrendingDown size={18} style={{ color: "var(--status-error)" }} />
              )}
              Utilidad Neta
            </span>
            <span
              style={{
                fontWeight: 700,
                fontSize: 16,
                fontVariantNumeric: "tabular-nums",
                color: esPositiva ? "var(--status-online)" : "var(--status-error)",
              }}
            >
              {formatMonto(utilidad)}
            </span>
          </section>
        </>
      ) : null}
    </div>
  );
}
