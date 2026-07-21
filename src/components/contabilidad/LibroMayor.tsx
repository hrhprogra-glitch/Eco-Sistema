"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { Layers } from "lucide-react";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { CuentaContable } from "./types";
import type { LibroMayorResponse } from "./librosTypes";

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

function SaldoTile({ label, valor }: { label: string; valor: number }) {
  const positivo = valor >= 0;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "12px 16px",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius)",
        background: "var(--bg-surface)",
        minWidth: 200,
      }}
    >
      <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em" }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 16,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          color: positivo ? "var(--status-online)" : "var(--status-error)",
        }}
      >
        {formatMonto(valor)}
      </span>
    </div>
  );
}

export default function LibroMayor() {
  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [cuentaId, setCuentaId] = useState("");
  const [desde, setDesde] = useState(primerDiaDelMes());
  const [hasta, setHasta] = useState(hoyISO());
  const [data, setData] = useState<LibroMayorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCuentas() {
      try {
        const res = await fetch("/api/contabilidad/cuentas");
        if (!res.ok) throw new Error("No se pudieron cargar las cuentas.");
        const rows: CuentaContable[] = await res.json();
        setCuentas(rows);
        setCuentaId((actual) => actual || rows[0]?.id || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido.");
      }
    }
    loadCuentas();
  }, []);

  const load = useCallback(async () => {
    if (!cuentaId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ cuenta_id: cuentaId, desde, hasta });
      const res = await fetch(`/api/contabilidad/libro-mayor?${params.toString()}`);
      if (!res.ok) throw new Error("No se pudo cargar el libro mayor.");
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, [cuentaId, desde, hasta]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 20, height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Layers size={22} style={{ color: "var(--accent-text)" }} />
        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Libro Mayor</h1>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
        <label className={fieldStyles.field} style={{ minWidth: 240 }}>
          <span className={fieldStyles.label}>Cuenta</span>
          <select className={fieldStyles.select} value={cuentaId} onChange={(e) => setCuentaId(e.target.value)}>
            {cuentas.length === 0 && <option value="">Sin cuentas</option>}
            {cuentas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.codigo} · {c.nombre}
              </option>
            ))}
          </select>
        </label>
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

      {!cuentaId ? (
        <p style={{ color: "var(--text-secondary)" }}>No hay cuentas registradas en el plan de cuentas.</p>
      ) : loading && !data ? (
        <p style={{ color: "var(--text-secondary)" }}>Cargando libro mayor...</p>
      ) : data ? (
        <>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <SaldoTile label="Saldo inicial" valor={data.saldo_inicial} />
            <SaldoTile label="Saldo final" valor={data.saldo_final} />
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Fecha</th>
                <th style={th}>Asiento</th>
                <th style={th}>Descripción</th>
                <th style={thRight}>Debe</th>
                <th style={thRight}>Haber</th>
                <th style={thRight}>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {data.movimientos.length === 0 ? (
                <tr>
                  <td style={td} colSpan={6}>
                    <span style={{ color: "var(--text-secondary)" }}>Sin movimientos confirmados en el período.</span>
                  </td>
                </tr>
              ) : (
                data.movimientos.map((m, idx) => (
                  <tr key={`${m.asiento_id}-${idx}`}>
                    <td style={td}>{formatFecha(m.fecha)}</td>
                    <td style={td}>N.º {m.numero}</td>
                    <td style={td}>
                      <span style={{ color: m.linea_descripcion ? "inherit" : "var(--text-secondary)" }}>
                        {m.linea_descripcion || m.asiento_descripcion}
                      </span>
                    </td>
                    <td style={tdRight}>{m.debe > 0 ? formatMonto(m.debe) : "—"}</td>
                    <td style={tdRight}>{m.haber > 0 ? formatMonto(m.haber) : "—"}</td>
                    <td style={{ ...tdRight, fontWeight: 600 }}>{formatMonto(m.saldo)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      ) : null}
    </div>
  );
}
