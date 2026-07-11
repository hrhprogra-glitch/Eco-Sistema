"use client";

import { useEffect, useState } from "react";
import { FormLayout } from "@/components/ui/FormLayout";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Contacto } from "@/components/contacto/types";
import type { EtapaOportunidad, Oportunidad } from "../types";

const ETAPAS: EtapaOportunidad[] = ["nuevo", "calificado", "propuesta", "ganado", "perdido"];
export const ETAPA_LABEL: Record<EtapaOportunidad, string> = {
  nuevo: "Nuevo",
  calificado: "Calificado",
  propuesta: "Propuesta",
  ganado: "Ganado",
  perdido: "Perdido",
};

export function OportunidadForm({
  oportunidad,
  onSaved,
  onCancel,
  onDeleted,
}: {
  oportunidad?: Oportunidad;
  onSaved: () => void;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [titulo, setTitulo] = useState(oportunidad?.titulo ?? "");
  const [contactoId, setContactoId] = useState(oportunidad?.contacto_id ?? "");
  const [etapa, setEtapa] = useState<EtapaOportunidad>(oportunidad?.etapa ?? "nuevo");
  const [montoEstimado, setMontoEstimado] = useState(oportunidad?.monto_estimado ?? 0);
  const [notas, setNotas] = useState(oportunidad?.notas ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/contactos")
      .then((res) => (res.ok ? res.json() : []))
      .then(setContactos)
      .catch(() => setContactos([]));
  }, []);

  async function handleSave() {
    if (!titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }
    if (!contactoId) {
      setError("Elegí un cliente.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = { titulo, contacto_id: contactoId, etapa, monto_estimado: montoEstimado, notas };
      const res = await fetch(oportunidad ? `/api/oportunidades/${oportunidad.id}` : "/api/oportunidades", {
        method: oportunidad ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("No se pudo guardar la oportunidad.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!oportunidad) return;
    if (!window.confirm(`¿Eliminar "${oportunidad.titulo}"? Esta acción no se puede deshacer.`)) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/oportunidades/${oportunidad.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar la oportunidad.");
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
          <span className={fieldStyles.label}>Título</span>
          <input className={fieldStyles.input} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </label>
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
          <span className={fieldStyles.label}>Etapa</span>
          <select
            className={fieldStyles.select}
            value={etapa}
            onChange={(e) => setEtapa(e.target.value as EtapaOportunidad)}
          >
            {ETAPAS.map((e) => (
              <option key={e} value={e}>
                {ETAPA_LABEL[e]}
              </option>
            ))}
          </select>
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Monto estimado</span>
          <input
            type="number"
            min={0}
            step="0.01"
            className={fieldStyles.input}
            value={montoEstimado}
            onChange={(e) => setMontoEstimado(Number(e.target.value))}
          />
        </label>
      </div>

      <label className={fieldStyles.field}>
        <span className={fieldStyles.label}>Notas</span>
        <textarea className={fieldStyles.textarea} value={notas} onChange={(e) => setNotas(e.target.value)} />
      </label>

      {oportunidad && (
        <button type="button" className={fieldStyles.deleteButton} onClick={handleDelete} disabled={isSaving}>
          Eliminar oportunidad
        </button>
      )}
    </FormLayout>
  );
}
