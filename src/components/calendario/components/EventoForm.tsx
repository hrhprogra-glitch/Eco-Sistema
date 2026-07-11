"use client";

import { useEffect, useState } from "react";
import { FormLayout } from "@/components/ui/FormLayout";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { EstadoEvento, EventoCalendario, EventoCalendarioInput, TipoEvento } from "../types";

const TIPOS: TipoEvento[] = ["nota", "recordatorio", "mantenimiento", "visita", "obra"];
const TIPO_LABEL: Record<TipoEvento, string> = {
  nota: "Nota",
  recordatorio: "Recordatorio",
  mantenimiento: "Mantenimiento",
  visita: "Visita",
  obra: "Obra",
};

const ESTADOS: EstadoEvento[] = ["pendiente", "completado", "cancelado"];
const ESTADO_LABEL: Record<EstadoEvento, string> = {
  pendiente: "Pendiente",
  completado: "Completado",
  cancelado: "Cancelado",
};

type Opcion = { id: string; nombre: string };

export function EventoForm({
  evento,
  onSaved,
  onCancel,
  onDeleted,
}: {
  evento?: EventoCalendario;
  onSaved: () => void;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [proyectos, setProyectos] = useState<Opcion[]>([]);
  const [piscinas, setPiscinas] = useState<Opcion[]>([]);
  const [titulo, setTitulo] = useState(evento?.titulo ?? "");
  const [fecha, setFecha] = useState(evento?.fecha?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [descripcion, setDescripcion] = useState(evento?.descripcion ?? "");
  const [estado, setEstado] = useState<EstadoEvento>(evento?.estado ?? "pendiente");
  const [tipo, setTipo] = useState<TipoEvento>(evento?.tipo ?? "nota");
  const [trabajadores, setTrabajadores] = useState(evento?.trabajadores ?? "");
  const [proyectoId, setProyectoId] = useState(evento?.proyecto_id ?? "");
  const [piscinaId, setPiscinaId] = useState(evento?.piscina_id ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/proyectos")
      .then((res) => (res.ok ? res.json() : []))
      .then(setProyectos)
      .catch(() => setProyectos([]));
    fetch("/api/piscinas")
      .then((res) => (res.ok ? res.json() : []))
      .then(setPiscinas)
      .catch(() => setPiscinas([]));
  }, []);

  async function handleSave() {
    if (!titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload: EventoCalendarioInput = {
        titulo,
        fecha,
        descripcion: descripcion || null,
        estado,
        tipo,
        trabajadores: trabajadores || null,
        proyecto_id: proyectoId || null,
        piscina_id: piscinaId || null,
      };
      const res = await fetch(evento ? `/api/calendario/${evento.id}` : "/api/calendario", {
        method: evento ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("No se pudo guardar el evento.");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!evento) return;
    if (!window.confirm(`¿Eliminar el evento "${evento.titulo}"? Esta acción no se puede deshacer.`)) return;

    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/calendario/${evento.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar el evento.");
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
          <span className={fieldStyles.label}>Fecha</span>
          <input
            type="date"
            className={fieldStyles.input}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Tipo</span>
          <select className={fieldStyles.select} value={tipo} onChange={(e) => setTipo(e.target.value as TipoEvento)}>
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {TIPO_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Estado</span>
          <select
            className={fieldStyles.select}
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoEvento)}
          >
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {ESTADO_LABEL[e]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={fieldStyles.row}>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Proyecto relacionado</span>
          <select className={fieldStyles.select} value={proyectoId} onChange={(e) => setProyectoId(e.target.value)}>
            <option value="">Ninguno</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Piscina relacionada</span>
          <select className={fieldStyles.select} value={piscinaId} onChange={(e) => setPiscinaId(e.target.value)}>
            <option value="">Ninguna</option>
            {piscinas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className={fieldStyles.field}>
          <span className={fieldStyles.label}>Trabajadores</span>
          <input
            className={fieldStyles.input}
            value={trabajadores}
            onChange={(e) => setTrabajadores(e.target.value)}
          />
        </label>
      </div>

      <label className={fieldStyles.field}>
        <span className={fieldStyles.label}>Descripción</span>
        <textarea
          className={fieldStyles.textarea}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </label>

      {evento && (
        <button type="button" className={fieldStyles.deleteButton} onClick={handleDelete} disabled={isSaving}>
          Eliminar evento
        </button>
      )}
    </FormLayout>
  );
}
