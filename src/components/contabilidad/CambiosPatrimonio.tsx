"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { Landmark } from "lucide-react";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { CambiosPatrimonioResponse } from "./librosTypes";

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

export default function CambiosPatrimonio() {
  const [desde, setDesde] = useState(primerDiaDelMes());
  const [hasta, setHasta] = useState(hoyISO());
  const [data, setData] = useState<CambiosPatrimonioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ desde, hasta });
      const res = await fetch(`/api/contabilidad/cambios-patrimonio?${params.toString()}`);
      if (!res.ok) throw new Error("No se pudo cargar el estado de cambios en el patrimonio.");
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

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 20, height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Landmark size={22} style={{ color: "var(--accent-text)" }} />
        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Estado de Cambios en el Patrimonio</h1>
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
        <p style={{ color: "var(--text-secondary)" }}>Cargando estado de cambios en el patrimonio...</p>
      ) : data ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Código</th>
              <th style={th}>Cuenta</th>
              <th style={thRight}>Saldo inicial</th>
              <th style={thRight}>Movimiento neto</th>
              <th style={thRight}>Saldo final</th>
            </tr>
          </thead>
          <tbody>
            {data.filas.length === 0 ? (
              <tr>
                <td style={td} colSpan={5}>
                  <span style={{ color: "var(--text-secondary)" }}>No hay cuentas de patrimonio en el plan de cuentas.</span>
                </td>
              </tr>
            ) : (
              data.filas.map((f) => (
                <tr key={f.cuenta_id}>
                  <td style={td}>{f.codigo}</td>
                  <td style={td}>{f.nombre}</td>
                  <td style={tdRight}>{formatMonto(f.saldo_inicial)}</td>
                  <td
                    style={{
                      ...tdRight,
                      color: f.movimiento_neto === 0 ? undefined : f.movimiento_neto > 0 ? "var(--status-online)" : "var(--status-error)",
                    }}
                  >
                    {formatMonto(f.movimiento_neto)}
                  </td>
                  <td style={{ ...tdRight, fontWeight: 600 }}>{formatMonto(f.saldo_final)}</td>
                </tr>
              ))
            )}
            <tr>
              <td style={{ ...td, fontWeight: 700, borderBottom: "none" }} colSpan={2}>
                Totales
              </td>
              <td style={{ ...tdRight, fontWeight: 700, borderBottom: "none" }}>{formatMonto(data.totales.saldo_inicial)}</td>
              <td style={{ ...tdRight, fontWeight: 700, borderBottom: "none" }}>{formatMonto(data.totales.movimiento_neto)}</td>
              <td style={{ ...tdRight, fontWeight: 700, borderBottom: "none" }}>{formatMonto(data.totales.saldo_final)}</td>
            </tr>
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
