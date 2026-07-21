"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { BookOpen } from "lucide-react";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { AsientoContable } from "./types";

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

function EstadoBadge({ estado }: { estado: AsientoContable["estado"] }) {
  const esConfirmado = estado === "confirmado";
  const color = esConfirmado ? "var(--status-online)" : "var(--status-pending)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.02em",
        color,
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
      }}
    >
      {esConfirmado ? "Confirmado" : "Borrador"}
    </span>
  );
}

export default function LibroDiario() {
  const [desde, setDesde] = useState(primerDiaDelMes());
  const [hasta, setHasta] = useState(hoyISO());
  const [asientos, setAsientos] = useState<AsientoContable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ desde, hasta });
      const res = await fetch(`/api/contabilidad/libro-diario?${params.toString()}`);
      if (!res.ok) throw new Error("No se pudo cargar el libro diario.");
      setAsientos(await res.json());
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
        <BookOpen size={22} style={{ color: "var(--accent-text)" }} />
        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Libro Diario</h1>
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

      {loading && asientos.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>Cargando libro diario...</p>
      ) : asientos.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>No hay asientos en el rango seleccionado.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {asientos.map((asiento) => {
            const totalDebe = asiento.lineas.reduce((sum, l) => sum + Number(l.debe), 0);
            const totalHaber = asiento.lineas.reduce((sum, l) => sum + Number(l.haber), 0);
            return (
              <section
                key={asiento.id}
                style={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius)",
                  background: "var(--bg-surface)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 12px",
                    borderBottom: "1px solid var(--border-color)",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>Asiento N.º {asiento.numero}</span>
                    <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{formatFecha(asiento.fecha)}</span>
                    <span style={{ fontSize: 13 }}>{asiento.descripcion}</span>
                  </div>
                  <EstadoBadge estado={asiento.estado} />
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>Cuenta</th>
                      <th style={th}>Descripción</th>
                      <th style={thRight}>Debe</th>
                      <th style={thRight}>Haber</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asiento.lineas.length === 0 ? (
                      <tr>
                        <td style={td} colSpan={4}>
                          <span style={{ color: "var(--text-secondary)" }}>Sin líneas.</span>
                        </td>
                      </tr>
                    ) : (
                      asiento.lineas.map((linea) => (
                        <tr key={linea.id}>
                          <td style={td}>
                            {linea.cuenta_codigo} · {linea.cuenta_nombre}
                          </td>
                          <td style={td}>
                            <span style={{ color: linea.descripcion ? "inherit" : "var(--text-secondary)" }}>
                              {linea.descripcion || "—"}
                            </span>
                          </td>
                          <td style={tdRight}>{Number(linea.debe) > 0 ? formatMonto(Number(linea.debe)) : "—"}</td>
                          <td style={tdRight}>{Number(linea.haber) > 0 ? formatMonto(Number(linea.haber)) : "—"}</td>
                        </tr>
                      ))
                    )}
                    <tr>
                      <td style={{ ...td, fontWeight: 700, borderBottom: "none" }} colSpan={2}>
                        Total
                      </td>
                      <td style={{ ...tdRight, fontWeight: 700, borderBottom: "none" }}>{formatMonto(totalDebe)}</td>
                      <td style={{ ...tdRight, fontWeight: 700, borderBottom: "none" }}>{formatMonto(totalHaber)}</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
