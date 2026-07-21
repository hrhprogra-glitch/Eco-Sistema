"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { FloatingWindow } from "@/components/ui/FloatingWindow";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Empleado } from "./types";

export function EmpleadoForm({
  empleado,
  onCancel,
  onSaved,
}: {
  empleado?: Empleado;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState(empleado?.nombre || "");
  const [puesto, setPuesto] = useState(empleado?.puesto || "");
  const [area, setArea] = useState(empleado?.area || "");
  const [fotoUrl, setFotoUrl] = useState(empleado?.foto_url || "");
  const [emailTrabajo, setEmailTrabajo] = useState(empleado?.email_trabajo || "");
  const [telefonoTrabajo, setTelefonoTrabajo] = useState(empleado?.telefono_trabajo || "");
  const [jefeDirecto, setJefeDirecto] = useState(empleado?.jefe_directo || "");
  const [dni, setDni] = useState(empleado?.dni || "");
  const [dniFotoUrl, setDniFotoUrl] = useState(empleado?.dni_foto_url || "");
  const [montoPago, setMontoPago] = useState(empleado?.monto_pago?.toString() || "");

  const title = empleado ? "Editar Empleado" : "Nuevo Empleado";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !puesto.trim() || !area.trim()) {
      setError("Nombre, puesto y área son requeridos.");
      return;
    }

    setGuardando(true);
    setError(null);

    const body = {
      nombre,
      puesto,
      area,
      foto_url: fotoUrl || null,
      email_trabajo: emailTrabajo || null,
      telefono_trabajo: telefonoTrabajo || null,
      jefe_directo: jefeDirecto || null,
      dni: dni || null,
      dni_foto_url: dniFotoUrl || null,
      monto_pago: montoPago ? parseFloat(montoPago) : null,
    };

    try {
      const url = empleado ? `/api/empleados/${empleado.id}` : `/api/empleados`;
      const method = empleado ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar el empleado");
      }

      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleDelete() {
    if (!empleado || !confirm("¿Seguro que quieres eliminar este empleado?")) return;
    setGuardando(true);
    try {
      const res = await fetch(`/api/empleados/${empleado.id}`, { method: "DELETE" });
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
            <label className={fieldStyles.label}>Nombre completo</label>
            <input
              type="text"
              className={fieldStyles.input}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Juan Pérez"
              required
              autoFocus
            />
          </div>

          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label}>Puesto</label>
            <input
              type="text"
              className={fieldStyles.input}
              value={puesto}
              onChange={(e) => setPuesto(e.target.value)}
              placeholder="Ej. Supervisor de Planta"
              required
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label}>Área</label>
            <input
              type="text"
              className={fieldStyles.input}
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Ej. Producción"
              required
            />
          </div>

          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label}>Jefe directo</label>
            <input
              type="text"
              className={fieldStyles.input}
              value={jefeDirecto}
              onChange={(e) => setJefeDirecto(e.target.value)}
              placeholder="Nombre del jefe directo"
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label}>Email de trabajo</label>
            <input
              type="email"
              className={fieldStyles.input}
              value={emailTrabajo}
              onChange={(e) => setEmailTrabajo(e.target.value)}
              placeholder="nombre@empresa.com"
            />
          </div>

          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label}>Teléfono de trabajo</label>
            <input
              type="text"
              className={fieldStyles.input}
              value={telefonoTrabajo}
              onChange={(e) => setTelefonoTrabajo(e.target.value)}
              placeholder="+51 999 999 999"
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label}>DNI</label>
            <input
              type="text"
              className={fieldStyles.input}
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="12345678"
            />
          </div>

          <div className={fieldStyles.formGroup}>
            <label className={fieldStyles.label}>Monto de pago</label>
            <input
              type="number"
              step="0.01"
              className={fieldStyles.input}
              value={montoPago}
              onChange={(e) => setMontoPago(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className={fieldStyles.formGroup}>
          <label className={fieldStyles.label}>URL de foto</label>
          <input
            type="text"
            className={fieldStyles.input}
            value={fotoUrl}
            onChange={(e) => setFotoUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className={fieldStyles.formGroup}>
          <label className={fieldStyles.label}>URL de foto del DNI</label>
          <input
            type="text"
            className={fieldStyles.input}
            value={dniFotoUrl}
            onChange={(e) => setDniFotoUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
          {empleado ? (
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
              {guardando ? "Guardando..." : "Guardar Empleado"}
            </button>
          </div>
        </div>
      </form>
    </FloatingWindow>
  );
}
