"use client";

import { useState, useEffect } from "react";
import { Save, Wrench } from "lucide-react";
import { FloatingWindow } from "@/components/ui/FloatingWindow";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { MantenimientoActivo, Activo } from "./types";

export function MantenimientoForm({
  mantenimiento,
  onCancel,
  onSaved,
}: {
  mantenimiento?: MantenimientoActivo;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activos, setActivos] = useState<Activo[]>([]);
  
  const [activoId, setActivoId] = useState(mantenimiento?.activo_id || "");
  const [tipoMantenimiento, setTipoMantenimiento] = useState<'preventivo' | 'correctivo'>(mantenimiento?.tipo_mantenimiento || 'preventivo');
  const [estado, setEstado] = useState<'pendiente' | 'completado' | 'cancelado'>(mantenimiento?.estado || 'pendiente');
  const [fechaProgramada, setFechaProgramada] = useState(mantenimiento?.fecha_programada ? mantenimiento.fecha_programada.split("T")[0] : "");
  const [fechaRealizada, setFechaRealizada] = useState(mantenimiento?.fecha_realizada ? mantenimiento.fecha_realizada.split("T")[0] : "");
  const [costo, setCosto] = useState(mantenimiento?.costo?.toString() || "");
  const [descripcion, setDescripcion] = useState(mantenimiento?.descripcion || "");

  useEffect(() => {
    fetch("/api/activos")
      .then(res => res.json())
      .then(data => setActivos(data))
      .catch(err => console.error("Error al cargar activos", err));
  }, []);

  const title = mantenimiento ? "Editar Mantenimiento" : "Registrar Mantenimiento";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!activoId) {
      setError("Debes seleccionar un activo.");
      return;
    }

    setGuardando(true);
    setError(null);

    const body = {
      activo_id: activoId,
      tipo_mantenimiento: tipoMantenimiento,
      estado,
      fecha_programada: fechaProgramada || null,
      fecha_realizada: fechaRealizada || null,
      costo: costo ? parseFloat(costo) : null,
      descripcion: descripcion || null,
    };

    try {
      const url = mantenimiento ? `/api/mantenimientos-activos/${mantenimiento.id}` : `/api/mantenimientos-activos`;
      const method = mantenimiento ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar el mantenimiento");
      }

      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleDelete() {
    if (!mantenimiento || !confirm("¿Seguro que quieres eliminar este mantenimiento?")) return;
    setGuardando(true);
    try {
      const res = await fetch(`/api/mantenimientos-activos/${mantenimiento.id}`, { method: "DELETE" });
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
          <label className={fieldStyles.label}>Activo a mantener</label>
          <select
            className={fieldStyles.input}
            value={activoId}
            onChange={(e) => setActivoId(e.target.value)}
            required
            autoFocus
          >
            <option value="">Seleccione un vehículo, equipo o herramienta...</option>
            {activos.map(a => (
              <option key={a.id} value={a.id}>
                {a.nombre} {a.identificador ? `(${a.identificador})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label}>Tipo de Mantenimiento</label>
            <select
              className={fieldStyles.input}
              value={tipoMantenimiento}
              onChange={(e) => setTipoMantenimiento(e.target.value as any)}
              required
            >
              <option value="preventivo">Preventivo (Rutina)</option>
              <option value="correctivo">Correctivo (Reparación)</option>
            </select>
          </div>

          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label}>Estado</label>
            <select
              className={fieldStyles.input}
              value={estado}
              onChange={(e) => setEstado(e.target.value as any)}
              required
            >
              <option value="pendiente">Pendiente</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label}>Fecha Programada</label>
            <input
              type="date"
              className={fieldStyles.input}
              value={fechaProgramada}
              onChange={(e) => setFechaProgramada(e.target.value)}
            />
          </div>
          
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label}>Fecha Realizada</label>
            <input
              type="date"
              className={fieldStyles.input}
              value={fechaRealizada}
              onChange={(e) => setFechaRealizada(e.target.value)}
            />
          </div>
        </div>

        <div className={fieldStyles.formGroup}>
          <label className={fieldStyles.label}>Costo Total ($)</label>
          <input
            type="number"
            step="0.01"
            className={fieldStyles.input}
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className={fieldStyles.formGroup}>
          <label className={fieldStyles.label}>Descripción de los trabajos</label>
          <textarea
            className={fieldStyles.textarea}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Cambio de aceite, filtros, etc."
            rows={3}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
          {mantenimiento ? (
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
              {guardando ? "Guardando..." : "Guardar Registro"}
            </button>
          </div>
        </div>
      </form>
    </FloatingWindow>
  );
}
