"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { Scale, CheckCircle2, AlertTriangle } from "lucide-react";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { BalanceGeneral as BalanceGeneralData, LineaEstadoContable } from "./types";

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

function Tabla({
  titulo,
  lineas,
  totalLabel,
  total,
  totalColor,
}: {
  titulo: string;
  lineas: LineaEstadoContable[];
  totalLabel: string;
  total: number;
  totalColor?: string;
}) {
  return (
    <section>
      <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px" }}>{titulo}</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>Código</th>
            <th style={th}>Cuenta</th>
            <th style={thRight}>Monto</th>
          </tr>
        </thead>
        <tbody>
          {lineas.length === 0 ? (
            <tr>
              <td style={td} colSpan={3}>
                <span style={{ color: "var(--text-secondary)" }}>Sin saldo a la fecha.</span>
              </td>
            </tr>
          ) : (
            lineas.map((l) => (
              <tr key={l.cuenta_id}>
                <td style={td}>{l.codigo}</td>
                <td style={td}>{l.nombre}</td>
                <td style={tdRight}>{formatMonto(l.monto)}</td>
              </tr>
            ))
          )}
          <tr>
            <td style={{ ...td, fontWeight: 700, borderBottom: "none" }} colSpan={2}>
              {totalLabel}
            </td>
            <td style={{ ...tdRight, fontWeight: 700, borderBottom: "none", color: totalColor }}>
              {formatMonto(total)}
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

export default function BalanceGeneral() {
  const [fecha, setFecha] = useState(hoyISO());
  const [data, setData] = useState<BalanceGeneralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ fecha });
      const res = await fetch(`/api/contabilidad/balance-general?${params.toString()}`);
      if (!res.ok) throw new Error("No se pudo cargar el balance general.");
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, [fecha]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 20, height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Scale size={22} style={{ color: "var(--accent-text)" }} />
        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Estado de Situación Financiera</h1>
      </div>

      <label className={fieldStyles.field} style={{ minWidth: 180, maxWidth: 220 }}>
        <span className={fieldStyles.label}>A la fecha</span>
        <input type="date" className={fieldStyles.input} value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </label>

      {error && <p className={fieldStyles.errorBanner}>{error}</p>}

      {loading && !data ? (
        <p style={{ color: "var(--text-secondary)" }}>Cargando balance general...</p>
      ) : data ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
            <Tabla titulo="Activo" lineas={data.activos} totalLabel="Total Activo" total={data.totalActivo} totalColor="var(--accent-text)" />

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Tabla titulo="Pasivo" lineas={data.pasivos} totalLabel="Total Pasivo" total={data.totalPasivo} />
              <Tabla titulo="Patrimonio" lineas={data.patrimonios} totalLabel="Total Patrimonio" total={data.totalPatrimonio} />

              <section
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 12px",
                  border: "1px dashed var(--border-color)",
                  borderRadius: "var(--radius)",
                }}
                title="Simplificación: no hay cierre de periodo todavía, así que la utilidad se calcula en vivo y se muestra aparte de Patrimonio."
              >
                <span style={{ fontSize: 14 }}>Utilidad del Ejercicio</span>
                <span
                  style={{
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    color: data.utilidadEjercicio >= 0 ? "var(--status-online)" : "var(--status-error)",
                  }}
                >
                  {formatMonto(data.utilidadEjercicio)}
                </span>
              </section>

              <section
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 12px",
                  fontWeight: 700,
                  borderTop: "2px solid var(--border-color)",
                }}
              >
                <span>Total Pasivo + Patrimonio</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatMonto(data.totalPasivoPatrimonio)}</span>
              </section>
            </div>
          </div>

          <section
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 16px",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius)",
              background: "var(--bg-surface)",
            }}
          >
            {data.cuadra ? (
              <CheckCircle2 size={20} style={{ color: "var(--status-online)", flexShrink: 0 }} />
            ) : (
              <AlertTriangle size={20} style={{ color: "var(--status-error)", flexShrink: 0 }} />
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontWeight: 700, color: data.cuadra ? "var(--status-online)" : "var(--status-error)" }}>
                {data.cuadra ? "El balance cuadra" : "El balance no cuadra"}
              </span>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Activo ({formatMonto(data.totalActivo)}) = Pasivo + Patrimonio + Utilidad del Ejercicio (
                {formatMonto(data.totalPasivoPatrimonio)})
              </span>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
