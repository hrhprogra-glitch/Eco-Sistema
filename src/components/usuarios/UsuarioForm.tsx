"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { FloatingWindow } from "@/components/ui/FloatingWindow";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Usuario } from "./types";

export function UsuarioForm({
  usuario,
  onCancel,
  onSaved,
}: {
  usuario?: Usuario;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState(usuario?.username || "");
  const [nombreCompleto, setNombreCompleto] = useState(usuario?.nombre_completo || "");
  // En edición arranca vacía siempre: nunca se prellena con nada relacionado a la
  // contraseña actual. Si el usuario no escribe nada acá, el hash existente no se toca.
  const [password, setPassword] = useState("");

  const title = usuario ? "Editar Usuario" : "Nuevo Usuario";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      setError("El nombre de usuario es requerido.");
      return;
    }
    if (!usuario && !password) {
      setError("La contraseña es requerida.");
      return;
    }

    setGuardando(true);
    setError(null);

    const body: Record<string, unknown> = {
      username: username.trim(),
      nombre_completo: nombreCompleto || null,
    };
    if (password) {
      body.password = password;
    }

    try {
      const url = usuario ? `/api/usuarios/${usuario.id}` : "/api/usuarios";
      const method = usuario ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar el usuario");
      }

      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleDelete() {
    if (!usuario || !confirm("¿Seguro que quieres eliminar este usuario?")) return;
    setGuardando(true);
    try {
      const res = await fetch(`/api/usuarios/${usuario.id}`, { method: "DELETE" });
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
          <label className={fieldStyles.label}>Usuario</label>
          <input
            type="text"
            className={fieldStyles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ej. jperez"
            required
            autoFocus
          />
        </div>

        <div className={fieldStyles.formGroup}>
          <label className={fieldStyles.label}>Nombre completo</label>
          <input
            type="text"
            className={fieldStyles.input}
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            placeholder="Ej. Juan Pérez"
          />
        </div>

        <div className={fieldStyles.formGroup}>
          <label className={fieldStyles.label}>{usuario ? "Nueva contraseña" : "Contraseña"}</label>
          <input
            type="password"
            className={fieldStyles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={usuario ? "Dejar en blanco para no cambiarla" : "Contraseña"}
            required={!usuario}
            autoComplete="new-password"
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
          {usuario ? (
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
              {guardando ? "Guardando..." : "Guardar Usuario"}
            </button>
          </div>
        </div>
      </form>
    </FloatingWindow>
  );
}
