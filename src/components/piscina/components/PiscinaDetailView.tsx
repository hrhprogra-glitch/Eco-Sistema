"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Plus, Trash2 } from "lucide-react";
import type { EventoCalendario, EventoCalendarioInput } from "@/components/calendario/types";
import type { Piscina, PiscinaInput, PiscinaPago, PiscinaPagoInput } from "../types";
import { ContactoPicker } from "./ContactoPicker";
import { MaterialesPiscina } from "./MaterialesPiscina";
import { PagosPiscina } from "./PagosPiscina";
import { RegistroMantenimiento } from "./RegistroMantenimiento";
import { SimpleSelect } from "./SimpleSelect";
import styles from "./PiscinaDetailView.module.css";

const TABS = [
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "pagos", label: "Pagos" },
  { value: "materiales", label: "Materiales" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

const ESTADO_OPCIONES: { value: Piscina["estado"]; label: string }[] = [
  { value: "operativa", label: "Operativa" },
  { value: "mantenimiento", label: "En mantenimiento" },
  { value: "cerrada", label: "Cerrada" },
];

const FRECUENCIA_OPCIONES: { value: Piscina["frecuencia"]; label: string }[] = [
  { value: "semanal", label: "Semanal" },
  { value: "quincenal", label: "Quincenal" },
];

export function PiscinaDetailView({
  piscina,
  isNew = false,
  isSaving = false,
  contactos,
  eventos,
  onBack,
  onSave,
  onDelete,
  onAddEvento,
  onDeleteEvento,
}: {
  piscina: Piscina;
  isNew?: boolean;
  isSaving?: boolean;
  contactos: { id: number; nombre: string }[];
  eventos: EventoCalendario[];
  onBack: () => void;
  onSave: (piscina: PiscinaInput) => void;
  onDelete?: () => void;
  onAddEvento: (input: EventoCalendarioInput) => void;
  onDeleteEvento: (evento: EventoCalendario) => void;
}) {
  const [form, setForm] = useState<PiscinaInput>({
    contacto_id: piscina.contacto_id || 0,
    nombre: piscina.nombre,
    ubicacion: piscina.ubicacion,
    estado: piscina.estado,
    notas: piscina.notas,
    frecuencia: piscina.frecuencia,
    precio_mantenimiento: piscina.precio_mantenimiento,
  });
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("mantenimiento");
  const [pagos, setPagos] = useState<PiscinaPago[]>([]);

  const fetchPagos = async () => {
    const res = await fetch("/api/piscina-pagos");
    if (res.ok) {
      const todos = (await res.json()) as PiscinaPago[];
      setPagos(todos.filter((pago) => pago.piscina_id === piscina.id));
    }
  };

  useEffect(() => {
    if (!isNew) fetchPagos();
  }, [isNew, piscina.id]);

  async function handleAddPago(input: PiscinaPagoInput) {
    const res = await fetch("/api/piscina-pagos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (res.ok) await fetchPagos();
  }

  async function handleUpdatePago(id: number, input: PiscinaPagoInput) {
    const res = await fetch(`/api/piscina-pagos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (res.ok) await fetchPagos();
  }

  async function handleDeletePago(id: number) {
    const res = await fetch(`/api/piscina-pagos/${id}`, { method: "DELETE" });
    if (res.ok) await fetchPagos();
  }

  function update<K extends keyof PiscinaInput>(key: K, value: PiscinaInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

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
          <button
            type="button"
            onClick={onBack}
            className={styles.discardButton}
            disabled={isSaving}
          >
            Descartar
          </button>
          <button
            type="button"
            onClick={() => onSave(form)}
            className={styles.saveButton}
            disabled={isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      <div className={styles.mainGrid}>
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

          <label className={styles.fieldLabel}>
            Ubicación (link de Google Maps)
            <div className={styles.ubicacionRow}>
              <input
                type="url"
                value={form.ubicacion}
                onChange={(event) => update("ubicacion", event.target.value)}
                placeholder="https://maps.google.com/..."
                className={styles.input}
              />
              {form.ubicacion && (
                <a
                  href={form.ubicacion}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mapLinkButton}
                  title="Abrir en Google Maps"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </label>

          <div className={styles.row2}>
            <label className={styles.fieldLabel}>
              Estado
              <SimpleSelect
                value={form.estado}
                options={ESTADO_OPCIONES}
                onChange={(value) => update("estado", value)}
              />
            </label>

            <label className={styles.fieldLabel}>
              Frecuencia de mantenimiento
              <SimpleSelect
                value={form.frecuencia}
                options={FRECUENCIA_OPCIONES}
                onChange={(value) => update("frecuencia", value)}
              />
            </label>
          </div>

          <label className={styles.fieldLabel}>
            Precio por mantenimiento (S/)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.precio_mantenimiento}
              onChange={(event) => update("precio_mantenimiento", Number(event.target.value))}
              className={styles.input}
            />
          </label>

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

        {!isNew && (
          <div className={styles.tabsSection}>
            <nav className={styles.tabNav}>
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`${styles.tabItem} ${activeTab === tab.value ? styles.tabActive : ""}`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {activeTab === "mantenimiento" && (
              <RegistroMantenimiento
                piscinaId={piscina.id}
                precioMantenimiento={form.precio_mantenimiento}
              />
            )}
            {activeTab === "pagos" && (
              <PagosPiscina
                piscinaId={piscina.id}
                pagos={pagos}
                onAdd={handleAddPago}
                onUpdate={handleUpdatePago}
                onDelete={handleDeletePago}
              />
            )}
            {activeTab === "materiales" && <MaterialesPiscina piscinaId={piscina.id} />}
          </div>
        )}
      </div>
    </div>
  );
}
