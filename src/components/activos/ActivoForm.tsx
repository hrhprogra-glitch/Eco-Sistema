"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { FloatingWindow } from "@/components/ui/FloatingWindow";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Activo, TipoActivo, EstadoActivo, TipoVehiculo } from "./types";

const TIPO_VEHICULO_LABEL: Record<TipoVehiculo, string> = {
  auto: "Auto",
  camioneta: "Camioneta",
  camion: "Camión",
  moto: "Moto",
  otro: "Otro",
};

export function ActivoForm({
  activo,
  tipoDefecto,
  onCancel,
  onSaved,
}: {
  activo?: Activo;
  tipoDefecto: TipoActivo;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tipo, setTipo] = useState<TipoActivo>(activo?.tipo || tipoDefecto);
  const [nombre, setNombre] = useState(activo?.nombre || "");
  const [identificador, setIdentificador] = useState(activo?.identificador || "");
  const [estado, setEstado] = useState<EstadoActivo>(activo?.estado || "disponible");
  const [fechaAdquisicion, setFechaAdquisicion] = useState(activo?.fecha_adquisicion ? activo.fecha_adquisicion.split("T")[0] : "");
  const [notas, setNotas] = useState(activo?.notas || "");
  const [asignadoA] = useState(activo?.asignado_a || "");
  const [tipoVehiculo, setTipoVehiculo] = useState<TipoVehiculo | "">(activo?.tipo_vehiculo || "");
  const [soatVencimiento, setSoatVencimiento] = useState(activo?.soat_vencimiento ? activo.soat_vencimiento.split("T")[0] : "");

  const title = activo ? "Editar Activo" : "Nuevo Activo";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El nombre es requerido.");
      return;
    }

    setGuardando(true);
    setError(null);

    const body = {
      tipo,
      nombre,
      identificador: identificador || null,
      estado,
      fecha_adquisicion: fechaAdquisicion || null,
      notas: notas || null,
      asignado_a: asignadoA || null,
      tipo_vehiculo: tipo === "vehiculo" ? tipoVehiculo || null : null,
      soat_vencimiento: tipo === "vehiculo" ? soatVencimiento || null : null,
    };

    try {
      const url = activo ? `/api/activos/${activo.id}` : `/api/activos`;
      const method = activo ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar el activo");
      }

      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleDelete() {
    if (!activo || !confirm("¿Seguro que quieres eliminar este activo?")) return;
    setGuardando(true);
    try {
      const res = await fetch(`/api/activos/${activo.id}`, { method: "DELETE" });
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label}>Tipo de Activo</label>
            <select
              className={fieldStyles.input}
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoActivo)}
              required
            >
              <option value="vehiculo">Vehículo / Auto</option>
              <option value="equipo">Equipo Mayor</option>
              <option value="herramienta">Herramienta</option>
            </select>
          </div>

          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label}>Estado</label>
            <select
              className={fieldStyles.input}
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoActivo)}
              required
            >
              <option value="disponible">Disponible</option>
              <option value="en_uso">En Uso / Asignado</option>
              <option value="mantenimiento">En Mantenimiento</option>
              <option value="baja">De Baja</option>
            </select>
          </div>
        </div>

        <div className={fieldStyles.formGroup}>
          <label className={fieldStyles.label}>Nombre o Descripción</label>
          <input
            type="text"
            className={fieldStyles.input}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Camioneta Toyota Hilux, Taladro Bosch..."
            required
            autoFocus
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label}>Identificador (Placa, Serie)</label>
            <input
              type="text"
              className={fieldStyles.input}
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              placeholder="OP-1234, ABC-987..."
            />
          </div>
          
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label}>Fecha Adquisición</label>
            <input
              type="date"
              className={fieldStyles.input}
              value={fechaAdquisicion}
              onChange={(e) => setFechaAdquisicion(e.target.value)}
            />
          </div>
        </div>

        {tipo === "vehiculo" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className={fieldStyles.formGroup}>
              <label className={fieldStyles.label}>Tipo de Vehículo</label>
              <select
                className={fieldStyles.input}
                value={tipoVehiculo}
                onChange={(e) => setTipoVehiculo(e.target.value as TipoVehiculo)}
              >
                <option value="">Sin especificar</option>
                {Object.entries(TIPO_VEHICULO_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className={fieldStyles.formGroup}>
              <label className={fieldStyles.label}>SOAT vence el</label>
              <input
                type="date"
                className={fieldStyles.input}
                value={soatVencimiento}
                onChange={(e) => setSoatVencimiento(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className={fieldStyles.formGroup}>
          <label className={fieldStyles.label}>Notas adicionales</label>
          <textarea
            className={fieldStyles.textarea}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Seguro vence en Dic, color rojo, etc."
            rows={3}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
          {activo ? (
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
              {guardando ? "Guardando..." : "Guardar Activo"}
            </button>
          </div>
        </div>
      </form>
    </FloatingWindow>
  );
}
