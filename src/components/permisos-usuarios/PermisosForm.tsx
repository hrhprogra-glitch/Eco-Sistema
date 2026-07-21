"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { FloatingWindow } from "@/components/ui/FloatingWindow";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Usuario } from "@/components/usuarios/types";

import { appGroups } from "@/components/lib/apps";

const MODULOS = appGroups.flatMap(g => {
  const items = [{ id: g.slug, label: `Módulo: ${g.name}` }];
  g.sections.forEach(s => {
    if (s.slug !== g.slug) {
      items.push({ id: `${g.slug}.${s.slug}`, label: `Sesión: ${s.name}` });
    }
  });
  return items;
});

export function PermisosForm({
  usuario,
  onCancel,
  onSaved,
}: {
  usuario: Usuario;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar estado de permisos (arreglo de strings)
  const [permisos, setPermisos] = useState<string[]>(Array.isArray(usuario.permisos) ? usuario.permisos : []);

  function togglePermiso(id: string) {
    if (permisos.includes(id)) {
      setPermisos(permisos.filter(p => p !== id));
    } else {
      setPermisos([...permisos, id]);
    }
  }

  function toggleAll() {
    if (permisos.length === MODULOS.length) {
      setPermisos([]);
    } else {
      setPermisos(MODULOS.map(m => m.id));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    const body = {
      username: usuario.username, // el username es requerido por el PATCH
      permisos
    };

    try {
      const res = await fetch(`/api/usuarios/${usuario.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar los permisos");
      }

      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <FloatingWindow title={`Permisos de: ${usuario.nombre_completo || usuario.username}`} onClose={onCancel}>
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px" }}>
        {error && <p className={fieldStyles.errorBanner}>{error}</p>}
        
        <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Marca las casillas de los módulos a los que este usuario tendrá acceso dentro del sistema.
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "-8px" }}>
          <button
            type="button"
            className={fieldStyles.secondaryButton}
            onClick={toggleAll}
            style={{ padding: "4px 8px", fontSize: "0.85rem" }}
          >
            {permisos.length === MODULOS.length ? "Desmarcar Todos" : "Marcar Todos"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px", background: "var(--bg-surface)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)", maxHeight: "400px", overflowY: "auto" }}>
          {MODULOS.map(mod => (
            <label key={mod.id} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.95rem", marginLeft: mod.label.startsWith("Sesión:") ? "24px" : "0px", fontWeight: mod.label.startsWith("Módulo:") ? 600 : 400 }}>
              <input
                type="checkbox"
                checked={permisos.includes(mod.id)}
                onChange={() => togglePermiso(mod.id)}
                style={{ width: "18px", height: "18px", accentColor: "var(--accent-color)" }}
              />
              {mod.label}
            </label>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" className={fieldStyles.secondaryButton} onClick={onCancel} disabled={guardando}>
              Cancelar
            </button>
            <button type="submit" className={fieldStyles.primaryButton} disabled={guardando}>
              <Save size={16} />
              {guardando ? "Guardando..." : "Guardar Permisos"}
            </button>
          </div>
        </div>
      </form>
    </FloatingWindow>
  );
}
