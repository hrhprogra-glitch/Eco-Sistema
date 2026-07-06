"use client";

import { useState } from "react";
import { Briefcase, Plus, Trash2, Waves } from "lucide-react";
import type { EstadoEvento, EventoCalendario, EventoCalendarioInput } from "../types";
import styles from "./DiaPanel.module.css";

type Vinculo = "ninguno" | "proyecto" | "piscina";

const ESTADO_LABEL: Record<EstadoEvento, string> = {
  pendiente: "Pendiente",
  completado: "Completado",
  cancelado: "Cancelado",
};

export function DiaPanel({
  fecha,
  eventos,
  proyectos,
  piscinas,
  onCreate,
  onUpdateEstado,
  onDelete,
}: {
  fecha: string;
  eventos: EventoCalendario[];
  proyectos: { id: number; nombre: string }[];
  piscinas: { id: number; nombre: string; contacto_nombre: string }[];
  onCreate: (input: EventoCalendarioInput) => void;
  onUpdateEstado: (evento: EventoCalendario, estado: EstadoEvento) => void;
  onDelete: (evento: EventoCalendario) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [vinculo, setVinculo] = useState<Vinculo>("ninguno");
  const [proyectoId, setProyectoId] = useState<number | null>(null);
  const [piscinaId, setPiscinaId] = useState<number | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!titulo.trim()) return;

    onCreate({
      titulo: titulo.trim(),
      fecha,
      descripcion: descripcion.trim() || null,
      estado: "pendiente",
      proyecto_id: vinculo === "proyecto" ? proyectoId : null,
      piscina_id: vinculo === "piscina" ? piscinaId : null,
    });

    setTitulo("");
    setDescripcion("");
    setVinculo("ninguno");
    setProyectoId(null);
    setPiscinaId(null);
  }

  const fechaLabel = new Date(`${fecha}T00:00:00`).toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>{fechaLabel}</h3>

      <div className={styles.list}>
        {eventos.length === 0 && <p className={styles.empty}>Sin eventos este día.</p>}
        {eventos.map((evento) => (
          <div key={evento.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <span className={styles.itemTitle}>{evento.titulo}</span>
              <button
                type="button"
                onClick={() => onDelete(evento)}
                className={styles.deleteButton}
                aria-label="Eliminar evento"
              >
                <Trash2 size={13} />
              </button>
            </div>

            {evento.piscina_nombre && (
              <span className={styles.linkBadge}>
                <Waves size={11} /> {evento.piscina_nombre} — {evento.contacto_nombre}
              </span>
            )}
            {evento.proyecto_nombre && (
              <span className={styles.linkBadge}>
                <Briefcase size={11} /> {evento.proyecto_nombre}
              </span>
            )}
            {evento.descripcion && <p className={styles.itemDesc}>{evento.descripcion}</p>}

            <select
              value={evento.estado}
              onChange={(event) => onUpdateEstado(evento, event.target.value as EstadoEvento)}
              className={`${styles.estadoSelect} ${styles[evento.estado]}`}
            >
              {(Object.keys(ESTADO_LABEL) as EstadoEvento[]).map((estado) => (
                <option key={estado} value={estado}>
                  {ESTADO_LABEL[estado]}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
          placeholder="Título (ej. Limpieza, Reunión...)"
          className={styles.input}
          required
        />

        <div className={styles.vinculoRow}>
          {(
            [
              ["ninguno", "General"],
              ["proyecto", "Proyecto"],
              ["piscina", "Piscina"],
            ] as [Vinculo, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setVinculo(value)}
              className={`${styles.vinculoButton} ${vinculo === value ? styles.vinculoActive : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        {vinculo === "proyecto" && (
          <select
            value={proyectoId ?? ""}
            onChange={(event) => setProyectoId(event.target.value ? Number(event.target.value) : null)}
            className={styles.input}
            required
          >
            <option value="">Seleccionar proyecto...</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        )}

        {vinculo === "piscina" && (
          <select
            value={piscinaId ?? ""}
            onChange={(event) => setPiscinaId(event.target.value ? Number(event.target.value) : null)}
            className={styles.input}
            required
          >
            <option value="">Seleccionar piscina...</option>
            {piscinas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre || "Piscina"} — {p.contacto_nombre}
              </option>
            ))}
          </select>
        )}

        <textarea
          value={descripcion}
          onChange={(event) => setDescripcion(event.target.value)}
          placeholder="Notas (opcional)"
          className={styles.textarea}
        />

        <button type="submit" className={styles.addButton}>
          <Plus size={14} />
          Agregar evento
        </button>
      </form>
    </div>
  );
}
