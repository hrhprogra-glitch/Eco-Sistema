"use client";

import { useState } from "react";
import { Briefcase, Plus, Trash2, Waves, Calendar, Info, FileText, CheckCircle, Users } from "lucide-react";
import type { EstadoEvento, EventoCalendario, EventoCalendarioInput, TipoEvento } from "../types";
import styles from "./DiaPanel.module.css";

type Vinculo = "ninguno" | "proyecto" | "piscina";

const ESTADO_LABEL: Record<EstadoEvento, string> = {
  pendiente: "Pendiente",
  completado: "Completado",
  cancelado: "Cancelado",
};

const TIPO_LABEL: Record<TipoEvento, string> = {
  nota: "Anotación",
  recordatorio: "Recordatorio",
  mantenimiento: "Mantenimiento",
  visita: "Visita de Trabajadores",
  obra: "Obra / Trabajo",
};

export function DiaPanel({
  fecha,
  eventos,
  proyectos,
  piscinas,
  empleados,
  onCreate,
  onUpdateEstado,
  onDelete,
}: {
  fecha: string;
  eventos: EventoCalendario[];
  proyectos: { id: string; nombre: string }[];
  piscinas: { id: string; nombre: string; contacto_nombre: string }[];
  empleados: { id: string; nombre: string }[];
  onCreate: (input: EventoCalendarioInput) => void;
  onUpdateEstado: (evento: EventoCalendario, estado: EstadoEvento) => void;
  onDelete: (evento: EventoCalendario) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<TipoEvento>("nota");
  const [trabajadores, setTrabajadores] = useState<string[]>([]);
  const [vinculo, setVinculo] = useState<Vinculo>("ninguno");
  const [proyectoId, setProyectoId] = useState<string | null>(null);
  const [piscinaId, setPiscinaId] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!titulo.trim()) return;

    onCreate({
      titulo: titulo.trim(),
      fecha,
      descripcion: descripcion.trim() || null,
      estado: "pendiente",
      tipo,
      trabajadores: trabajadores.length > 0 ? trabajadores.join(", ") : null,
      proyecto_id: vinculo === "proyecto" ? proyectoId : null,
      piscina_id: vinculo === "piscina" ? piscinaId : null,
    });

    setTitulo("");
    setDescripcion("");
    setTipo("nota");
    setTrabajadores([]);
    setVinculo("ninguno");
    setProyectoId(null);
    setPiscinaId(null);
  }

  const handleTrabajadorToggle = (nombre: string) => {
    setTrabajadores((prev) => 
      prev.includes(nombre) 
        ? prev.filter((t) => t !== nombre)
        : [...prev, nombre]
    );
  };

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
          <div key={evento.id} className={`${styles.item} ${styles[`tipo-${evento.tipo}`] || ""}`}>
            <div className={styles.itemHeader}>
              <div className={styles.itemTitleWrapper}>
                <span className={styles.tipoBadge}>
                  {TIPO_LABEL[evento.tipo] || "Evento"}
                </span>
                <span className={styles.itemTitle}>{evento.titulo}</span>
              </div>
              <button
                type="button"
                onClick={() => onDelete(evento)}
                className={styles.deleteButton}
                aria-label="Eliminar evento"
              >
                <Trash2 size={13} />
              </button>
            </div>

            <div className={styles.badgesWrapper}>
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
              {evento.trabajadores && (
                <span className={styles.linkBadge}>
                  <Users size={11} /> {evento.trabajadores}
                </span>
              )}
            </div>
            
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
        <div className={styles.formHeader}>Agregar Nuevo Evento</div>
        
        <select
          value={tipo}
          onChange={(event) => setTipo(event.target.value as TipoEvento)}
          className={styles.input}
          required
        >
          {(Object.entries(TIPO_LABEL) as [TipoEvento, string][]).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
          placeholder="Título (ej. Limpieza, Reunión...)"
          className={styles.input}
          required
        />

        {/* Solo mostrar selector de trabajadores si es obra, mantenimiento o visita */}
        {['mantenimiento', 'obra', 'visita'].includes(tipo) && (
          <div className={styles.trabajadoresWrapper}>
            <label className={styles.label}>Asignar Trabajadores:</label>
            <div className={styles.checkboxGrid}>
              {empleados.map(emp => (
                <label key={emp.id} className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={trabajadores.includes(emp.nombre)}
                    onChange={() => handleTrabajadorToggle(emp.nombre)}
                  />
                  {emp.nombre}
                </label>
              ))}
            </div>
          </div>
        )}

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
            onChange={(event) => setProyectoId(event.target.value || null)}
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
            onChange={(event) => setPiscinaId(event.target.value || null)}
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
          placeholder="Notas o descripción detallada (opcional)"
          className={styles.textarea}
        />

        <button type="submit" className={styles.addButton}>
          <Plus size={14} />
          Guardar evento
        </button>
      </form>
    </div>
  );
}
