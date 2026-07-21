"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { FloatingWindow } from "@/components/ui/FloatingWindow";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Rol } from "./types";

export function RolForm({
  rol,
  onCancel,
  onSaved,
}: {
  rol?: Rol;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState(rol?.nombre || "");
  const [descripcion, setDescripcion] = useState(rol?.descripcion || "");
  const [permisosTexto, setPermisosTexto] = useState((rol?.permisos || []).join(", "));

  const title = rol ? "Editar Rol" : "Nuevo Rol";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El nombre es requerido.");
      return;
    }

    setGuardando(true);
    setError(null);

    const permisos = permisosTexto
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const body = {
      nombre,
      descripcion: descripcion || null,
      permisos,
    };

    try {
      const url = rol ? `/api/roles-permisos/${rol.id}` : `/api/roles-permisos`;
      const method = rol ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar el rol");
      }

      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleDelete() {
    if (!rol || !confirm("¿Seguro que quieres eliminar este rol?")) return;
    setGuardando(true);
    try {
      const res = await fetch(`/api/roles-permisos/${rol.id}`, { method: "DELETE" });
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
          <label className={fieldStyles.label}>Nombre del Rol</label>
          <input
            type="text"
            className={fieldStyles.input}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Administrador, Vendedor, Contador..."
            required
            autoFocus
          />
        </div>

        <div className={fieldStyles.formGroup}>
          <label className={fieldStyles.label}>Descripción</label>
          <textarea
            className={fieldStyles.textarea}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Qué puede hacer este rol dentro del sistema..."
            rows={4}
          />
        </div>

        <div className={fieldStyles.formGroup}>
          <label className={fieldStyles.label}>Permisos (separados por coma)</label>
          <input
            type="text"
            className={fieldStyles.input}
            value={permisosTexto}
            onChange={(e) => setPermisosTexto(e.target.value)}
            placeholder="ver_ventas, editar_inventario, ver_reportes..."
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
          {rol ? (
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
              {guardando ? "Guardando..." : "Guardar Rol"}
            </button>
          </div>
        </div>
      </form>
    </FloatingWindow>
  );
}
