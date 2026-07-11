"use client";

import { useEffect, useState } from "react";
import { FormLayout } from "@/components/ui/FormLayout";
import { LineaItemsEditor, type LineaItem } from "@/components/ui/LineaItemsEditor";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Contacto } from "@/components/contacto/types";
import type { Venta, VentaEstado } from "../types";

const ESTADOS: VentaEstado[] = ["borrador", "confirmada", "facturada", "cancelada"];
const ESTADO_LABEL: Record<VentaEstado, string> = {
  borrador: "Borrador",
  confirmada: "Confirmada",
  facturada: "Facturada",
  cancelada: "Cancelada",
};

export function VentaForm({
  venta,
  onSaved,
  onCancel,
  onDeleted,
}: {
  venta?: Venta;
  onSaved: () => void;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [contactoId, setContactoId] = useState(venta?.contacto_id ?? "");
  const [estado, setEstado] = useState<VentaEstado>(venta?.estado ?? "borrador");
  const [fecha, setFecha] = useState(venta?.fecha?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [notas, setNotas] = useState(venta?.notas ?? "");
  const [lineas, setLineas] = useState<LineaItem[]>(
    venta?.lineas?.map((linea) => ({
      producto_id: linea.producto_id,
      cantidad: linea.cantidad,
      precio_unitario: linea.precio_unitario,
      subtotal: linea.subtotal,
    })) ?? []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/contactos")
      .then((res) => (res.ok ? res.json() : []))
      .then(setContactos)
      .catch(() => setContactos([]));
  }, []);

  async function handleSave() {
    if (!contactoId) {
      setError("Elegí un cliente.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const total = lineas.reduce((sum, linea) => sum + linea.subtotal, 0);
      const payload = { contacto_id: contactoId, estado, total, fecha, notas, lineas };
      const res = await fetch(venta ? `/api/ventas/${venta.id}` : "/api/ventas", {
        method: venta ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("No se pudo guardar la venta.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!venta) return;
    if (!window.confirm(`¿Eliminar la venta #${venta.numero}? Esta acción no se puede deshacer.`)) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/ventas/${venta.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar la venta.");
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
          <span className={fieldStyles.label}>Cliente</span>
          <select
            className={fieldStyles.select}
            value={contactoId}
            onChange={(e) => setContactoId(e.target.value)}
          >
            <option value="">Seleccionar cliente…</option>
            {contactos.map((contacto) => (
              <option key={contacto.id} value={contacto.id}>
                {contacto.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Estado</span>
          <select
            className={fieldStyles.select}
            value={estado}
            onChange={(e) => setEstado(e.target.value as VentaEstado)}
          >
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {ESTADO_LABEL[e]}
              </option>
            ))}
          </select>
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Fecha</span>
          <input
            type="date"
            className={fieldStyles.input}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </label>
      </div>

      <p className={fieldStyles.sectionTitle}>Productos</p>
      <LineaItemsEditor value={lineas} onChange={setLineas} />

      <label className={fieldStyles.field}>
        <span className={fieldStyles.label}>Notas</span>
        <textarea
          className={fieldStyles.textarea}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </label>

      {venta && (
        <button type="button" className={fieldStyles.deleteButton} onClick={handleDelete} disabled={isSaving}>
          Eliminar venta
        </button>
      )}
    </FormLayout>
  );
}
