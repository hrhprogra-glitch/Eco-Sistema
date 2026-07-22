"use client";

import { useState } from "react";
import { FormLayout } from "@/components/ui/FormLayout";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Contacto } from "../types";

type ContactoFormData = Pick<
  Contacto,
  "nombre" | "tipo" | "telefono" | "email" | "movil" | "personaContacto" | "ubicacionUrl" | "notas"
> & { direccion: string; documentoTipo: string; documentoNumero: string };

const DATOS_VACIOS: ContactoFormData = {
  nombre: "",
  tipo: "cliente",
  telefono: "",
  email: "",
  movil: "",
  personaContacto: "",
  direccion: "",
  ubicacionUrl: "",
  notas: "",
  documentoTipo: "RUC",
  documentoNumero: "",
};

export function ContactoForm({
  contacto,
  onCancel,
  onSaved,
  onDeleted,
}: {
  contacto?: Contacto;
  onCancel: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [data, setData] = useState<ContactoFormData>(
    contacto
      ? {
          nombre: contacto.nombre,
          tipo: contacto.tipo,
          telefono: contacto.telefono,
          email: contacto.email,
          movil: contacto.movil ?? "",
          personaContacto: contacto.personaContacto ?? "",
          direccion: contacto.direccion?.calle ?? "",
          ubicacionUrl: contacto.ubicacionUrl ?? "",
          notas: contacto.notas ?? "",
          documentoTipo: contacto.identificaciones?.[0]?.tipo || "RUC",
          documentoNumero: contacto.identificaciones?.[0]?.numero ?? "",
        }
      : DATOS_VACIOS
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof ContactoFormData>(key: K, value: ContactoFormData[K]) {
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
      const { documentoTipo, documentoNumero, ...resto } = data;
      const payload = {
        ...resto,
        direccion: { calle: data.direccion, calle2: "", distrito: "", ciudad: "", estado: "", zip: "", pais: "" },
        identificaciones: documentoNumero.trim() ? [{ tipo: documentoTipo, numero: documentoNumero.trim() }] : [],
      };
      const res = await fetch(contacto ? `/api/contactos/${contacto.id}` : "/api/contactos", {
        method: contacto ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("No se pudo guardar el contacto.");
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
    if (!contacto) return;
    if (!window.confirm(`¿Eliminar a ${contacto.nombre}? Esta acción no se puede deshacer.`)) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/contactos/${contacto.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar el contacto.");
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
      setIsSaving(false);
    }
  }

  return (
    <FormLayout
      title={contacto ? contacto.nombre : "Nuevo cliente"}
      onSave={handleSave}
      onCancel={onCancel}
      onSaveAndNew={contacto ? undefined : handleSaveAndNew}
      onDelete={contacto ? handleDelete : undefined}
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
          <span className={fieldStyles.label}>Teléfono</span>
          <input
            className={fieldStyles.input}
            value={data.telefono}
            onChange={(e) => setField("telefono", e.target.value)}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>E-mail</span>
          <input
            type="email"
            className={fieldStyles.input}
            value={data.email}
            onChange={(e) => setField("email", e.target.value)}
          />
        </label>
      </div>

      <div className={fieldStyles.row}>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Móvil</span>
          <input
            className={fieldStyles.input}
            value={data.movil}
            onChange={(e) => setField("movil", e.target.value)}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Persona de contacto</span>
          <input
            className={fieldStyles.input}
            value={data.personaContacto}
            onChange={(e) => setField("personaContacto", e.target.value)}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Tipo de cliente</span>
          <select
            className={fieldStyles.select}
            value={data.tipo}
            onChange={(e) => setField("tipo", e.target.value as Contacto["tipo"])}
          >
            <option value="cliente">Cliente</option>
            <option value="proveedor">Proveedor</option>
            <option value="otro">Otro</option>
          </select>
        </label>
      </div>

      <div className={fieldStyles.row}>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Dirección</span>
          <input
            className={fieldStyles.input}
            value={data.direccion}
            onChange={(e) => setField("direccion", e.target.value)}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Ubicación (URL)</span>
          <input
            type="url"
            className={fieldStyles.input}
            placeholder="https://maps.google.com/…"
            value={data.ubicacionUrl}
            onChange={(e) => setField("ubicacionUrl", e.target.value)}
          />
        </label>
      </div>

      <div className={fieldStyles.row}>
        <label className={fieldStyles.field} style={{ maxWidth: "140px" }}>
          <span className={fieldStyles.label}>Tipo de documento</span>
          <select
            className={fieldStyles.select}
            value={data.documentoTipo}
            onChange={(e) => setField("documentoTipo", e.target.value)}
          >
            <option value="RUC">RUC</option>
            <option value="DNI">DNI</option>
          </select>
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>N° de RUC / DNI</span>
          <input
            className={fieldStyles.input}
            value={data.documentoNumero}
            onChange={(e) => setField("documentoNumero", e.target.value)}
          />
        </label>
      </div>

      <div className={fieldStyles.row}>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Notas</span>
          <input
            className={fieldStyles.input}
            value={data.notas}
            onChange={(e) => setField("notas", e.target.value)}
          />
        </label>
      </div>
    </FormLayout>
  );
}
