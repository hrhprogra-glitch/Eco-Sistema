"use client";

import { useState } from "react";
import { AlertTriangle, ArrowLeft, Droplet, Plus, Trash2 } from "lucide-react";
import type { EventoCalendario, EventoCalendarioInput } from "@/components/calendario/types";
import type { Piscina, PiscinaInput, PiscinaPago, PiscinaPagoInput } from "../types";
import { tieneAlertaCloro } from "../alertas";
import { ContactoPicker } from "./ContactoPicker";
import { MaterialesPiscina } from "./MaterialesPiscina";
import { PagosPiscina } from "./PagosPiscina";
import styles from "./PiscinaDetailView.module.css";

const ESTADO_OPCIONES: { value: Piscina["estado"]; label: string }[] = [
  { value: "operativa", label: "Operativa" },
  { value: "mantenimiento", label: "En mantenimiento" },
  { value: "cerrada", label: "Cerrada" },
];

type Tab = "datos" | "materiales" | "pagos";

export function PiscinaDetailView({
  piscina,
  isNew = false,
  isSaving = false,
  contactos,
  eventos,
  pagos,
  onBack,
  onSave,
  onDelete,
  onAddEvento,
  onDeleteEvento,
  onAddPago,
  onUpdatePago,
  onDeletePago,
}: {
  piscina: Piscina;
  isNew?: boolean;
  isSaving?: boolean;
  contactos: { id: number; nombre: string }[];
  eventos: EventoCalendario[];
  pagos: PiscinaPago[];
  onBack: () => void;
  onSave: (piscina: PiscinaInput) => void;
  onDelete?: () => void;
  onAddEvento: (input: EventoCalendarioInput) => void;
  onDeleteEvento: (evento: EventoCalendario) => void;
  onAddPago: (input: PiscinaPagoInput) => Promise<void>;
  onUpdatePago: (id: number, input: PiscinaPagoInput) => Promise<void>;
  onDeletePago: (id: number) => Promise<void>;
}) {
  const [tab, setTab] = useState<Tab>("datos");
  const [form, setForm] = useState<PiscinaInput>({
    contacto_id: piscina.contacto_id || 0,
    nombre: piscina.nombre,
    ubicacion: piscina.ubicacion,
    volumen_m3: piscina.volumen_m3,
    estado: piscina.estado,
    nivel_cloro: piscina.nivel_cloro,
    notas: piscina.notas,
  });
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaFecha, setNuevaFecha] = useState("");

  function update<K extends keyof PiscinaInput>(key: K, value: PiscinaInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const alertaCloro =
    form.nivel_cloro !== null &&
    tieneAlertaCloro({ ...piscina, nivel_cloro: form.nivel_cloro });

  function handleAddEvento(event: React.FormEvent) {
    event.preventDefault();
    if (!nuevoTitulo.trim() || !nuevaFecha) return;
    onAddEvento({
      titulo: nuevoTitulo.trim(),
      fecha: nuevaFecha,
      descripcion: null,
      estado: "pendiente",
      proyecto_id: null,
      piscina_id: piscina.id,
    });
    setNuevoTitulo("");
    setNuevaFecha("");
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.topBar}>
        <button type="button" onClick={onBack} className={styles.back}>
          <ArrowLeft size={15} />
          Piscinas
        </button>
        <span className={styles.crumbSeparator}>/</span>
        <span className={styles.crumbCurrent}>
          {isNew ? "Nueva piscina" : piscina.nombre || "Sin nombre"}
        </span>

        <div className={styles.topBarActions}>
          {!isNew && onDelete && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("¿Eliminar esta piscina? Esta acción no se puede deshacer.")) {
                  onDelete();
                }
              }}
              className={styles.deleteButton}
              disabled={isSaving}
              aria-label="Eliminar piscina"
              title="Eliminar piscina"
            >
              <Trash2 size={15} />
            </button>
          )}
          {tab === "datos" && (
            <>
              <button
                type="button"
                onClick={onBack}
                className={styles.discardButton}
                disabled={isSaving}
              >
                Descartar
              </button>
              <button
                type="submit"
                form="piscina-datos-form"
                className={styles.saveButton}
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Guardar"}
              </button>
            </>
          )}
        </div>
      </div>

      {!isNew && (
        <div className={styles.tabNav}>
          <button
            type="button"
            className={`${styles.tabItem} ${tab === "datos" ? styles.tabActive : ""}`}
            onClick={() => setTab("datos")}
          >
            Datos generales
          </button>
          <button
            type="button"
            className={`${styles.tabItem} ${tab === "materiales" ? styles.tabActive : ""}`}
            onClick={() => setTab("materiales")}
          >
            Materiales
          </button>
          <button
            type="button"
            className={`${styles.tabItem} ${tab === "pagos" ? styles.tabActive : ""}`}
            onClick={() => setTab("pagos")}
          >
            Pagos
          </button>
        </div>
      )}

      {tab === "datos" && (
        <form
          id="piscina-datos-form"
          className={styles.mainGrid}
          onSubmit={(event) => {
            event.preventDefault();
            onSave(form);
          }}
        >
          <div className={styles.mainColumn}>
            <label className={styles.fieldLabel}>
              Cliente
              <ContactoPicker
                contactos={contactos}
                selectedId={form.contacto_id || null}
                onSelect={(id) => update("contacto_id", id)}
              />
            </label>

            <label className={styles.fieldLabel}>
              Nombre / identificador de la piscina
              <input
                type="text"
                value={form.nombre}
                onChange={(event) => update("nombre", event.target.value)}
                placeholder="Ej. Piscina principal"
                className={styles.input}
              />
            </label>

            <div className={styles.row2}>
              <label className={styles.fieldLabel}>
                Ubicación
                <input
                  type="text"
                  value={form.ubicacion}
                  onChange={(event) => update("ubicacion", event.target.value)}
                  placeholder="Ej. Jardín trasero"
                  className={styles.input}
                />
              </label>

              <label className={styles.fieldLabel}>
                Volumen (m³)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.volumen_m3}
                  onChange={(event) => update("volumen_m3", Number(event.target.value))}
                  className={styles.input}
                />
              </label>
            </div>

            <div className={styles.row2}>
              <label className={styles.fieldLabel}>
                Estado
                <select
                  value={form.estado}
                  onChange={(event) => update("estado", event.target.value as Piscina["estado"])}
                  className={styles.input}
                >
                  {ESTADO_OPCIONES.map((opcion) => (
                    <option key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.fieldLabel}>
                <span className={styles.labelWithIcon}>
                  <Droplet size={14} /> Nivel de cloro (ppm)
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.nivel_cloro ?? ""}
                  onChange={(event) =>
                    update("nivel_cloro", event.target.value === "" ? null : Number(event.target.value))
                  }
                  className={styles.input}
                />
                {alertaCloro && (
                  <span className={styles.cloroWarning}>
                    <AlertTriangle size={12} /> Fuera del rango recomendado (1–3 ppm)
                  </span>
                )}
              </label>
            </div>

            <label className={styles.fieldLabel}>
              Notas
              <textarea
                value={form.notas}
                onChange={(event) => update("notas", event.target.value)}
                placeholder="Detalles adicionales sobre esta piscina..."
                className={styles.textarea}
              />
            </label>
          </div>

          <aside className={styles.sideColumn}>
            <h3 className={styles.sectionTitle}>Mantenimientos programados</h3>

            <div className={styles.eventosList}>
              {eventos.length === 0 && (
                <p className={styles.emptyEventos}>Todavía no hay mantenimientos para esta piscina.</p>
              )}
              {eventos.map((evento) => (
                <div key={evento.id} className={styles.eventoItem}>
                  <div>
                    <p className={styles.eventoTitulo}>{evento.titulo}</p>
                    <p className={styles.eventoFecha}>
                      {new Date(`${evento.fecha}T00:00:00`).toLocaleDateString("es-PE")} ·{" "}
                      {evento.estado}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteEvento(evento)}
                    className={styles.eventoDelete}
                    aria-label="Eliminar mantenimiento"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {!isNew && (
              <div className={styles.addEvento}>
                <input
                  type="text"
                  value={nuevoTitulo}
                  onChange={(event) => setNuevoTitulo(event.target.value)}
                  placeholder="Ej. Limpieza, control de químicos..."
                  className={styles.input}
                />
                <input
                  type="date"
                  value={nuevaFecha}
                  onChange={(event) => setNuevaFecha(event.target.value)}
                  className={styles.input}
                />
                <button type="button" onClick={handleAddEvento} className={styles.addButton}>
                  <Plus size={14} />
                  Agregar mantenimiento
                </button>
              </div>
            )}
          </aside>
        </form>
      )}

      {tab === "materiales" && !isNew && <MaterialesPiscina piscinaId={piscina.id} />}

      {tab === "pagos" && !isNew && (
        <PagosPiscina
          piscinaId={piscina.id}
          pagos={pagos}
          onAdd={onAddPago}
          onUpdate={onUpdatePago}
          onDelete={onDeletePago}
        />
      )}
    </div>
  );
}
