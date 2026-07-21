"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { FloatingWindow } from "@/components/ui/FloatingWindow";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Piscina, EstadoPiscina, FrecuenciaPiscina } from "../types";

export function PiscinaForm({
  piscina,
  onCancel,
  onSaved,
}: {
  piscina?: Piscina;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contactos, setContactos] = useState<{ id: string; nombre: string }[]>([]);

  const [contactoId, setContactoId] = useState(piscina?.contacto_id || "");
  const [nombre, setNombre] = useState(piscina?.nombre || "");
  const [ubicacion, setUbicacion] = useState(piscina?.ubicacion || "");
  const [estado, setEstado] = useState<EstadoPiscina>(piscina?.estado || "operativa");
  const [frecuencia, setFrecuencia] = useState<FrecuenciaPiscina>(piscina?.frecuencia || "semanal");
  const [precioMantenimiento, setPrecioMantenimiento] = useState(piscina?.precio_mantenimiento?.toString() || "0");
  const [notas, setNotas] = useState(piscina?.notas || "");

  useEffect(() => {
    fetch("/api/contactos")
      .then(res => res.json())
      .then(data => setContactos(data))
      .catch(err => console.error("Error al cargar clientes", err));
  }, []);

  const title = piscina ? "Editar Piscina" : "Nueva Piscina";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!contactoId || !nombre.trim()) {
      setError("Cliente y nombre son requeridos.");
      return;
    }

    setGuardando(true);
    setError(null);

    const body = {
      contacto_id: contactoId,
      nombre,
      ubicacion,
      estado,
      frecuencia,
      precio_mantenimiento: parseFloat(precioMantenimiento) || 0,
      notas: notas || null,
    };

    try {
      const url = piscina ? `/api/piscinas/${piscina.id}` : `/api/piscinas`;
      const method = piscina ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar la piscina");
      }

      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleDelete() {
    if (!piscina || !confirm("¿Seguro que quieres eliminar esta piscina?")) return;
    setGuardando(true);
    try {
      const res = await fetch(`/api/piscinas/${piscina.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      onSaved();
    } catch (err: any) {
      setError(err.message);
      setGuardando(false);
    }
  }

  return (
    <FloatingWindow title={title} onClose={onCancel}>
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px" }}>
        {error && <p className={fieldStyles.errorBanner}>{error}</p>}

        <div className={fieldStyles.formGroup}>
          <label className={fieldStyles.label}>Cliente / Propietario</label>
          <select
            className={fieldStyles.input}
            value={contactoId}
            onChange={(e) => setContactoId(e.target.value)}
            required
            autoFocus
          >
            <option value="">Seleccione un cliente...</option>
            {contactos.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label}>Nombre o Referencia</label>
            <input
              type="text"
              className={fieldStyles.input}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Piscina Principal"
              required
            />
          </div>

          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label}>Estado</label>
            <select
              className={fieldStyles.input}
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoPiscina)}
              required
            >
              <option value="operativa">Operativa</option>
              <option value="mantenimiento">En Mantenimiento</option>
              <option value="cerrada">Cerrada</option>
            </select>
          </div>
        </div>

        <div className={fieldStyles.formGroup}>
          <label className={fieldStyles.label}>Ubicación / Dirección</label>
          <input
            type="text"
            className={fieldStyles.input}
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            placeholder="Dirección o ubicación dentro del predio"
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label}>Frecuencia de Mantenimiento</label>
            <select
              className={fieldStyles.input}
              value={frecuencia}
              onChange={(e) => setFrecuencia(e.target.value as FrecuenciaPiscina)}
              required
            >
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
            </select>
          </div>

          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label}>Precio de Mantenimiento ($)</label>
            <input
              type="number"
              step="0.01"
              className={fieldStyles.input}
              value={precioMantenimiento}
              onChange={(e) => setPrecioMantenimiento(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className={fieldStyles.formGroup}>
          <label className={fieldStyles.label}>Notas adicionales</label>
          <textarea
            className={fieldStyles.textarea}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Dimensiones, volumen de agua, equipos instalados..."
            rows={3}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
          {piscina ? (
            <button type="button" className={fieldStyles.deleteButton} onClick={handleDelete} disabled={guardando}>
              Eliminar
            </button>
          ) : (
            <div />
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" className={fieldStyles.secondaryButton} onClick={onCancel} disabled={guardando}>
              Cancelar
            </button>
            <button type="submit" className={fieldStyles.primaryButton} disabled={guardando}>
              <Save size={16} />
              {guardando ? "Guardando..." : "Guardar Piscina"}
            </button>
          </div>
        </div>
      </form>
    </FloatingWindow>
  );
}
