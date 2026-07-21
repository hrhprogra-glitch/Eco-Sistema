"use client";

import { useState } from "react";
import { FloatingWindow } from "@/components/ui/FloatingWindow";
import fieldStyles from "@/components/ui/formFields.module.css";

export function PermisosForm({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
      // TODO: Implementar lógica de permisos
      setGuardando(false);
      onSaved();
    } catch (err: any) {
      setError(err.message);
      setGuardando(false);
    }
  }

  return (
    <FloatingWindow title="Permisos" onClose={onCancel}>
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px" }}>
        {error && <p className={fieldStyles.errorBanner}>{error}</p>}

        <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Módulo en construcción — trabajando solo online.
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
          <button type="button" className={fieldStyles.secondaryButton} onClick={onCancel} disabled={guardando}>
            Cancelar
          </button>
          <button type="submit" className={fieldStyles.primaryButton} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </FloatingWindow>
  );
}
