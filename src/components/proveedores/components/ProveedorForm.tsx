"use client";

import { useState } from "react";
import { FormLayout } from "@/components/ui/FormLayout";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Proveedor } from "../types";

type ProveedorFormData = Pick<Proveedor, "nombre" | "ruc" | "contacto" | "telefono" | "email" | "notas">;

const DATOS_VACIOS: ProveedorFormData = {
  nombre: "",
  ruc: "",
  contacto: "",
  telefono: "",
  email: "",
  notas: "",
};

export function ProveedorForm({
  proveedor,
  onCancel,
  onSaved,
  onDeleted,
}: {
  proveedor?: Proveedor;
  onCancel: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [data, setData] = useState<ProveedorFormData>(
    proveedor
      ? {
          nombre: proveedor.nombre,
          ruc: proveedor.ruc ?? "",
          contacto: proveedor.contacto ?? "",
          telefono: proveedor.telefono ?? "",
          email: proveedor.email ?? "",
          notas: proveedor.notas ?? "",
        }
      : DATOS_VACIOS
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof ProveedorFormData>(key: K, value: ProveedorFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function guardar(): Promise<boolean> {
    if (!data.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return false;
    }

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(proveedor ? `/api/proveedores/${proveedor.id}` : "/api/proveedores", {
        method: proveedor ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("No se pudo guardar el proveedor.");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSave() {
    if (await guardar()) onSaved();
  }

  async function handleSaveAndNew() {
    if (!(await guardar())) return;
    setData(DATOS_VACIOS);
  }

  async function handleDelete() {
    if (!proveedor) return;
    if (!window.confirm(`¿Eliminar a ${proveedor.nombre}? Esta acción no se puede deshacer.`)) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/proveedores/${proveedor.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar el proveedor.");
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
      setIsSaving(false);
    }
  }

  return (
    <FormLayout
      title={proveedor ? proveedor.nombre : "Nuevo proveedor"}
      onSave={handleSave}
      onCancel={onCancel}
      onSaveAndNew={proveedor ? undefined : handleSaveAndNew}
      onDelete={proveedor ? handleDelete : undefined}
      isSaving={isSaving}
    >
      {error && <p className={fieldStyles.errorBanner}>{error}</p>}

      <div className={fieldStyles.row}>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Nombre</span>
          <input
            className={fieldStyles.input}
            value={data.nombre}
            onChange={(e) => setField("nombre", e.target.value)}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>RUC</span>
          <input
            className={fieldStyles.input}
            value={data.ruc ?? ""}
            onChange={(e) => setField("ruc", e.target.value)}
          />
        </label>
      </div>

      <div className={fieldStyles.row}>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Persona de contacto</span>
          <input
            className={fieldStyles.input}
            value={data.contacto ?? ""}
            onChange={(e) => setField("contacto", e.target.value)}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Teléfono</span>
          <input
            className={fieldStyles.input}
            value={data.telefono ?? ""}
            onChange={(e) => setField("telefono", e.target.value)}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>E-mail</span>
          <input
            type="email"
            className={fieldStyles.input}
            value={data.email ?? ""}
            onChange={(e) => setField("email", e.target.value)}
          />
        </label>
      </div>

      <label className={fieldStyles.field}>
        <span className={fieldStyles.label}>Notas</span>
        <textarea
          className={fieldStyles.textarea}
          rows={3}
          value={data.notas ?? ""}
          onChange={(e) => setField("notas", e.target.value)}
        />
      </label>
    </FormLayout>
  );
}
