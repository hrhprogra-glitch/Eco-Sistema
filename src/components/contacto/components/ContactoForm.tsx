"use client";

import { useState } from "react";
import { FormLayout } from "@/components/ui/FormLayout";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Contacto, Direccion } from "../types";

type ContactoFormData = Omit<Contacto, "id" | "created_at">;

const DIRECCION_VACIA: Direccion = {
  calle: "",
  calle2: "",
  distrito: "",
  ciudad: "",
  estado: "",
  zip: "",
  pais: "",
};

const DATOS_VACIOS: ContactoFormData = {
  nombre: "",
  tipo: "cliente",
  esEmpresa: false,
  email: "",
  telefono: "",
  sitioWeb: "",
  puestoTrabajo: "",
  direccion: DIRECCION_VACIA,
  identificaciones: [],
  etiquetas: [],
  contactosRelacionados: [],
  notas: "",
};

export function ContactoForm({
  contacto,
  onSaved,
  onCancel,
  onDeleted,
}: {
  contacto?: Contacto;
  onSaved: () => void;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [data, setData] = useState<ContactoFormData>(contacto ? { ...contacto } : DATOS_VACIOS);
  const [etiquetasTexto, setEtiquetasTexto] = useState(contacto?.etiquetas.join(", ") ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof ContactoFormData>(key: K, value: ContactoFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function setDireccion(key: keyof Direccion, value: string) {
    setData((prev) => ({ ...prev, direccion: { ...prev.direccion, [key]: value } }));
  }

  async function handleSave() {
    if (!data.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        ...data,
        etiquetas: etiquetasTexto
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const res = await fetch(contacto ? `/api/contactos/${contacto.id}` : "/api/contactos", {
        method: contacto ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("No se pudo guardar el contacto.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setIsSaving(false);
    }
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
    <FormLayout onSave={handleSave} onCancel={onCancel} isSaving={isSaving}>
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
          <span className={fieldStyles.label}>Tipo</span>
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
        <label className={fieldStyles.checkboxRow}>
          <input
            type="checkbox"
            checked={data.esEmpresa}
            onChange={(e) => setField("esEmpresa", e.target.checked)}
          />
          Es empresa
        </label>
      </div>

      <div className={fieldStyles.row}>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Email</span>
          <input
            type="email"
            className={fieldStyles.input}
            value={data.email}
            onChange={(e) => setField("email", e.target.value)}
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
          <span className={fieldStyles.label}>Sitio web</span>
          <input
            className={fieldStyles.input}
            value={data.sitioWeb}
            onChange={(e) => setField("sitioWeb", e.target.value)}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Puesto de trabajo</span>
          <input
            className={fieldStyles.input}
            value={data.puestoTrabajo}
            onChange={(e) => setField("puestoTrabajo", e.target.value)}
          />
        </label>
      </div>

      <p className={fieldStyles.sectionTitle}>Dirección</p>
      <div className={fieldStyles.row}>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Calle</span>
          <input
            className={fieldStyles.input}
            value={data.direccion.calle}
            onChange={(e) => setDireccion("calle", e.target.value)}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Calle 2</span>
          <input
            className={fieldStyles.input}
            value={data.direccion.calle2}
            onChange={(e) => setDireccion("calle2", e.target.value)}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Distrito</span>
          <input
            className={fieldStyles.input}
            value={data.direccion.distrito}
            onChange={(e) => setDireccion("distrito", e.target.value)}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Ciudad</span>
          <input
            className={fieldStyles.input}
            value={data.direccion.ciudad}
            onChange={(e) => setDireccion("ciudad", e.target.value)}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Estado / Provincia</span>
          <input
            className={fieldStyles.input}
            value={data.direccion.estado}
            onChange={(e) => setDireccion("estado", e.target.value)}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Código postal</span>
          <input
            className={fieldStyles.input}
            value={data.direccion.zip}
            onChange={(e) => setDireccion("zip", e.target.value)}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>País</span>
          <input
            className={fieldStyles.input}
            value={data.direccion.pais}
            onChange={(e) => setDireccion("pais", e.target.value)}
          />
        </label>
      </div>

      <label className={fieldStyles.field}>
        <span className={fieldStyles.label}>Etiquetas (separadas por coma)</span>
        <input
          className={fieldStyles.input}
          value={etiquetasTexto}
          onChange={(e) => setEtiquetasTexto(e.target.value)}
        />
      </label>

      <label className={fieldStyles.field}>
        <span className={fieldStyles.label}>Notas</span>
        <textarea
          className={fieldStyles.textarea}
          value={data.notas}
          onChange={(e) => setField("notas", e.target.value)}
        />
      </label>

      {contacto && (
        <button type="button" className={fieldStyles.deleteButton} onClick={handleDelete} disabled={isSaving}>
          Eliminar contacto
        </button>
      )}
    </FormLayout>
  );
}
