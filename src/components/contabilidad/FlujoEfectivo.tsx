"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { Banknote, ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { FlujoEfectivoResponse } from "./librosTypes";

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

function formatFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-CO");
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

function Tile({ label, valor, color, icon: Icon }: { label: string; valor: number; color: string; icon: typeof Banknote }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius)",
        background: "var(--bg-surface)",
        minWidth: 200,
        flex: "1 1 200px",
      }}
    >
      <Icon size={20} style={{ color, flexShrink: 0 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em" }}>
          {label}
        </span>
        <span style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums", color }}>{formatMonto(valor)}</span>
      </div>
    </div>
  );
}

export default function FlujoEfectivo() {
  const [desde, setDesde] = useState(primerDiaDelMes());
  const [hasta, setHasta] = useState(hoyISO());
  const [data, setData] = useState<FlujoEfectivoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ desde, hasta });
      const res = await fetch(`/api/contabilidad/flujo-efectivo?${params.toString()}`);
      if (!res.ok) throw new Error("No se pudo cargar el estado de flujo de efectivo.");
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
        <Banknote size={22} style={{ color: "var(--accent-text)" }} />
        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Estado de Flujo de Efectivo</h1>
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
        <p style={{ color: "var(--text-secondary)" }}>Cargando flujo de efectivo...</p>
      ) : data ? (
        <>
          {data.cuentas.length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>
              No se encontraron cuentas de efectivo (Caja / Bancos) en el plan de cuentas.
            </p>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
                Cuentas consideradas: {data.cuentas.map((c) => `${c.codigo} · ${c.nombre}`).join(", ")}
              </p>

              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Tile label="Entradas de efectivo" valor={data.entradas} color="var(--status-online)" icon={ArrowUpCircle} />
                <Tile label="Salidas de efectivo" valor={data.salidas} color="var(--status-error)" icon={ArrowDownCircle} />
                <Tile
                  label="Variación neta"
                  valor={data.neto}
                  color={data.neto >= 0 ? "var(--status-online)" : "var(--status-error)"}
                  icon={Scale}
                />
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={th}>Fecha</th>
                    <th style={th}>Asiento</th>
                    <th style={th}>Descripción</th>
                    <th style={th}>Cuenta</th>
                    <th style={thRight}>Entrada</th>
                    <th style={thRight}>Salida</th>
                  </tr>
                </thead>
                <tbody>
                  {data.movimientos.length === 0 ? (
                    <tr>
                      <td style={td} colSpan={6}>
                        <span style={{ color: "var(--text-secondary)" }}>Sin movimientos de efectivo confirmados en el período.</span>
                      </td>
                    </tr>
                  ) : (
                    data.movimientos.map((m, idx) => (
                      <tr key={`${m.asiento_id}-${idx}`}>
                        <td style={td}>{formatFecha(m.fecha)}</td>
                        <td style={td}>N.º {m.numero}</td>
                        <td style={td}>{m.descripcion}</td>
                        <td style={td}>
                          {m.cuenta_codigo} · {m.cuenta_nombre}
                        </td>
                        <td style={{ ...tdRight, color: m.debe > 0 ? "var(--status-online)" : undefined }}>
                          {m.debe > 0 ? formatMonto(m.debe) : "—"}
                        </td>
                        <td style={{ ...tdRight, color: m.haber > 0 ? "var(--status-error)" : undefined }}>
                          {m.haber > 0 ? formatMonto(m.haber) : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </>
          )}
        </>
      ) : null}
    </div>
  );
}
