"use client";

import { useMemo, useState } from "react";
import { SimpleSelect } from "@/components/piscina/components/SimpleSelect";
import type { AsientoContable, CuentaContable } from "../types";
import { movimientoNeto } from "../naturaleza";
import styles from "./LibroMayor.module.css";

export function LibroMayor({ cuentas, asientos }: { cuentas: CuentaContable[]; asientos: AsientoContable[] }) {
  const [cuentaId, setCuentaId] = useState<string>(cuentas[0] ? String(cuentas[0].id) : "");
  const cuenta = cuentas.find((c) => c.id === Number(cuentaId));

  const cuentaOptions = cuentas.map((c) => ({ value: String(c.id), label: `${c.codigo} · ${c.nombre}` }));

  const movimientos = useMemo(() => {
    if (!cuenta) return [];
    const filas: { fecha: string; descripcion: string; debe: number; haber: number; asientoId: number }[] = [];
    for (const asiento of asientos) {
      if (asiento.estado !== "confirmado") continue;
      for (const linea of asiento.lineas) {
        if (linea.cuenta_id !== cuenta.id) continue;
        filas.push({
          fecha: asiento.fecha,
          descripcion: linea.descripcion || asiento.descripcion,
          debe: Number(linea.debe),
          haber: Number(linea.haber),
          asientoId: asiento.id,
        });
      }
    }
    filas.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.asientoId - b.asientoId);

    let saldo = 0;
    return filas.map((f) => {
      saldo += movimientoNeto(cuenta.tipo, f.debe, f.haber);
      return { ...f, saldo };
    });
  }, [cuenta, asientos]);

  if (cuentas.length === 0) {
    return <div className={styles.emptyState}>Creá cuentas en el Plan de Cuentas para ver el Libro Mayor.</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.selectRow}>
        <span className={styles.label}>Cuenta:</span>
        <SimpleSelect value={cuentaId} options={cuentaOptions} onChange={setCuentaId} placeholder="Seleccionar cuenta" />
      </div>

      {movimientos.length === 0 ? (
        <div className={styles.emptyState}>Esta cuenta no tiene movimientos confirmados todavía.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Asiento</th>
              <th>Detalle</th>
              <th className={styles.amount}>Debe</th>
              <th className={styles.amount}>Haber</th>
              <th className={styles.amount}>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((m, i) => (
              <tr key={i}>
                <td>{new Date(m.fecha).toLocaleDateString("es-PE")}</td>
                <td>ASI-{String(m.asientoId).padStart(5, "0")}</td>
                <td>{m.descripcion}</td>
                <td className={styles.amount}>{m.debe > 0 ? `S/ ${m.debe.toFixed(2)}` : "—"}</td>
                <td className={styles.amount}>{m.haber > 0 ? `S/ ${m.haber.toFixed(2)}` : "—"}</td>
                <td className={styles.amount}>S/ {m.saldo.toFixed(2)}</td>
              </tr>
            ))}
            <tr className={styles.saldoRow}>
              <td colSpan={5}>Saldo final</td>
              <td className={styles.amount}>S/ {movimientos[movimientos.length - 1].saldo.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
