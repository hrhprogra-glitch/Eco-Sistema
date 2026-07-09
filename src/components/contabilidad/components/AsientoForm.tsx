"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { FormLayout } from "@/components/ui/FormLayout";
import { SimpleSelect } from "@/components/piscina/components/SimpleSelect";
import type { CuentaContable } from "../types";
import styles from "./AsientoForm.module.css";

type LineaDraft = {
  key: string;
  cuenta_id: number | "";
  debe: string;
  haber: string;
  descripcion: string;
};

function emptyLinea(): LineaDraft {
  return { key: `l-${Date.now()}-${Math.random()}`, cuenta_id: "", debe: "", haber: "", descripcion: "" };
}

export function AsientoForm({
  cuentas,
  onSave,
  onCancel,
}: {
  cuentas: CuentaContable[];
  onSave: (data: {
    fecha: string;
    descripcion: string;
    lineas: { cuenta_id: number; debe: number; haber: number; descripcion: string | null }[];
  }) => Promise<string | void>;
  onCancel: () => void;
}) {
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [descripcion, setDescripcion] = useState("");
  const [lineas, setLineas] = useState<LineaDraft[]>([emptyLinea(), emptyLinea()]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const cuentaOptions = cuentas.map((c) => ({ value: String(c.id), label: `${c.codigo} · ${c.nombre}` }));

  const updateLinea = (key: string, patch: Partial<LineaDraft>) => {
    setLineas((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  };

  const removeLinea = (key: string) => {
    setLineas((prev) => (prev.length > 2 ? prev.filter((l) => l.key !== key) : prev));
  };

  const totalDebe = lineas.reduce((sum, l) => sum + (parseFloat(l.debe) || 0), 0);
  const totalHaber = lineas.reduce((sum, l) => sum + (parseFloat(l.haber) || 0), 0);
  const cuadra = Math.abs(totalDebe - totalHaber) < 0.005 && totalDebe > 0;

  const handleSave = async () => {
    if (!descripcion.trim()) {
      setError("La descripción del asiento es obligatoria");
      return;
    }
    if (!cuadra) {
      setError("El asiento no cuadra: Debe y Haber deben ser iguales y mayores a cero");
      return;
    }
    if (lineas.some((l) => !l.cuenta_id)) {
      setError("Todas las líneas necesitan una cuenta");
      return;
    }

    setIsSaving(true);
    setError(null);
    const result = await onSave({
      fecha,
      descripcion: descripcion.trim(),
      lineas: lineas.map((l) => ({
        cuenta_id: Number(l.cuenta_id),
        debe: parseFloat(l.debe) || 0,
        haber: parseFloat(l.haber) || 0,
        descripcion: l.descripcion.trim() || null,
      })),
    });
    setIsSaving(false);
    if (result) setError(result);
  };

  return (
    <FormLayout onSave={handleSave} onCancel={onCancel} isSaving={isSaving}>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.headerRow}>
        <div className={`${styles.field} ${styles.fieldFecha}`}>
          <label className={styles.label}>Fecha</label>
          <input type="date" className={styles.input} value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        <div className={`${styles.field} ${styles.fieldDescripcion}`}>
          <label className={styles.label}>Descripción</label>
          <input
            className={styles.input}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej. Pago de alquiler de local"
          />
        </div>
      </div>

      <table className={styles.lineasTable}>
        <thead>
          <tr>
            <th style={{ width: "34%" }}>Cuenta</th>
            <th style={{ width: "22%" }}>Detalle</th>
            <th style={{ width: "15%" }}>Debe</th>
            <th style={{ width: "15%" }}>Haber</th>
            <th style={{ width: "5%" }} />
          </tr>
        </thead>
        <tbody>
          {lineas.map((l) => (
            <tr key={l.key}>
              <td>
                <SimpleSelect
                  value={l.cuenta_id === "" ? "" : String(l.cuenta_id)}
                  options={cuentaOptions}
                  onChange={(v) => updateLinea(l.key, { cuenta_id: Number(v) })}
                  placeholder="Seleccionar cuenta"
                />
              </td>
              <td>
                <input
                  className={`${styles.lineInput} ${styles.lineDescInput}`}
                  value={l.descripcion}
                  onChange={(e) => updateLinea(l.key, { descripcion: e.target.value })}
                  placeholder="Opcional"
                />
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  className={styles.lineInput}
                  value={l.debe}
                  onChange={(e) => updateLinea(l.key, { debe: e.target.value, haber: e.target.value ? "" : l.haber })}
                  placeholder="0.00"
                />
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  className={styles.lineInput}
                  value={l.haber}
                  onChange={(e) => updateLinea(l.key, { haber: e.target.value, debe: e.target.value ? "" : l.debe })}
                  placeholder="0.00"
                />
              </td>
              <td>
                <button type="button" className={styles.removeBtn} onClick={() => removeLinea(l.key)} title="Quitar línea">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button type="button" className={styles.addLineBtn} onClick={() => setLineas((prev) => [...prev, emptyLinea()])}>
        + Agregar línea
      </button>

      <div className={`${styles.totalsRow} ${cuadra ? styles.totalsBalanced : styles.totalsUnbalanced}`}>
        <span>Debe: S/ {totalDebe.toFixed(2)}</span>
        <span>Haber: S/ {totalHaber.toFixed(2)}</span>
        <span>{cuadra ? "Cuadrado" : "No cuadra"}</span>
      </div>
    </FormLayout>
  );
}
