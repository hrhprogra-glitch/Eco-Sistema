"use client";

import { useState } from "react";
import { FormLayout } from "@/components/ui/FormLayout";
import { SimpleSelect } from "@/components/piscina/components/SimpleSelect";
import type { CuentaContable, TipoCuenta } from "../types";
import styles from "./CuentaForm.module.css";

const TIPO_OPTIONS: { value: TipoCuenta; label: string }[] = [
  { value: "activo", label: "Activo" },
  { value: "pasivo", label: "Pasivo" },
  { value: "patrimonio", label: "Patrimonio" },
  { value: "ingreso", label: "Ingreso" },
  { value: "gasto", label: "Gasto" },
];

export function CuentaForm({
  cuenta,
  onSave,
  onCancel,
}: {
  cuenta?: CuentaContable;
  onSave: (data: { codigo: string; nombre: string; tipo: TipoCuenta }) => Promise<string | void>;
  onCancel: () => void;
}) {
  const [codigo, setCodigo] = useState(cuenta?.codigo ?? "");
  const [nombre, setNombre] = useState(cuenta?.nombre ?? "");
  const [tipo, setTipo] = useState<TipoCuenta | "">(cuenta?.tipo ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!codigo.trim() || !nombre.trim() || !tipo) {
      setError("Completá código, nombre y tipo");
      return;
    }
    setIsSaving(true);
    setError(null);
    const result = await onSave({ codigo: codigo.trim(), nombre: nombre.trim(), tipo });
    setIsSaving(false);
    if (result) setError(result);
  };

  return (
    <FormLayout onSave={handleSave} onCancel={onCancel} isSaving={isSaving}>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.field}>
        <label className={styles.label}>Código</label>
        <input
          className={styles.input}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Ej. 1000"
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Nombre</label>
        <input
          className={styles.input}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Caja"
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Tipo</label>
        <SimpleSelect value={tipo} options={TIPO_OPTIONS} onChange={setTipo} placeholder="Seleccionar tipo" />
      </div>
    </FormLayout>
  );
}
