"use client";

import { useMemo } from "react";
import type { AsientoContable, CuentaContable } from "../types";
import { esNaturalezaDeudora } from "../naturaleza";
import styles from "./BalanceComprobacion.module.css";

export function BalanceComprobacion({ cuentas, asientos }: { cuentas: CuentaContable[]; asientos: AsientoContable[] }) {
  const filas = useMemo(() => {
    const totales = new Map<string, { debe: number; haber: number }>();
    for (const asiento of asientos) {
      if (asiento.estado !== "confirmado") continue;
      for (const linea of asiento.lineas) {
        const acc = totales.get(linea.cuenta_id) || { debe: 0, haber: 0 };
        acc.debe += Number(linea.debe);
        acc.haber += Number(linea.haber);
        totales.set(linea.cuenta_id, acc);
      }
    }

    return cuentas
      .map((c) => {
        const t = totales.get(c.id) || { debe: 0, haber: 0 };
        const neto = esNaturalezaDeudora(c.tipo) ? t.debe - t.haber : t.haber - t.debe;
        return {
          cuenta: c,
          debe: t.debe,
          haber: t.haber,
          saldoDeudor: neto >= 0 && esNaturalezaDeudora(c.tipo) ? neto : neto < 0 && !esNaturalezaDeudora(c.tipo) ? -neto : 0,
          saldoAcreedor: neto >= 0 && !esNaturalezaDeudora(c.tipo) ? neto : neto < 0 && esNaturalezaDeudora(c.tipo) ? -neto : 0,
        };
      })
      .filter((f) => f.debe > 0 || f.haber > 0);
  }, [cuentas, asientos]);

  const totalDebe = filas.reduce((s, f) => s + f.debe, 0);
  const totalHaber = filas.reduce((s, f) => s + f.haber, 0);
  const totalSaldoDeudor = filas.reduce((s, f) => s + f.saldoDeudor, 0);
  const totalSaldoAcreedor = filas.reduce((s, f) => s + f.saldoAcreedor, 0);
  const cuadra = Math.abs(totalSaldoDeudor - totalSaldoAcreedor) < 0.005;

  if (filas.length === 0) {
    return <div className={styles.emptyState}>No hay asientos confirmados todavía para calcular el balance.</div>;
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Cuenta</th>
          <th className={styles.amount}>Debe</th>
          <th className={styles.amount}>Haber</th>
          <th className={styles.amount}>Saldo Deudor</th>
          <th className={styles.amount}>Saldo Acreedor</th>
        </tr>
      </thead>
      <tbody>
        {filas.map((f) => (
          <tr key={f.cuenta.id}>
            <td>
              {f.cuenta.codigo} · {f.cuenta.nombre}
            </td>
            <td className={styles.amount}>S/ {f.debe.toFixed(2)}</td>
            <td className={styles.amount}>S/ {f.haber.toFixed(2)}</td>
            <td className={styles.amount}>{f.saldoDeudor > 0 ? `S/ ${f.saldoDeudor.toFixed(2)}` : "—"}</td>
            <td className={styles.amount}>{f.saldoAcreedor > 0 ? `S/ ${f.saldoAcreedor.toFixed(2)}` : "—"}</td>
          </tr>
        ))}
        <tr className={styles.totalsRow}>
          <td>Total</td>
          <td className={styles.amount}>S/ {totalDebe.toFixed(2)}</td>
          <td className={styles.amount}>S/ {totalHaber.toFixed(2)}</td>
          <td className={`${styles.amount} ${cuadra ? styles.balanced : styles.unbalanced}`}>
            S/ {totalSaldoDeudor.toFixed(2)}
          </td>
          <td className={`${styles.amount} ${cuadra ? styles.balanced : styles.unbalanced}`}>
            S/ {totalSaldoAcreedor.toFixed(2)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
