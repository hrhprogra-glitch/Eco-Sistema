"use client";

import { useEffect, useState } from "react";
import { UserCog, UserPlus } from "lucide-react";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import { DataTable, type Column } from "@/components/ui/DataTable";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Usuario } from "./types";
import { UsuarioForm } from "./UsuarioForm";

export default function UsuariosModule({ adminNavContent }: { adminNavContent?: React.ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<
    { mode: "list" } | { mode: "form"; usuario?: Usuario }
  >({ mode: "list" });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("0-9");

  async function loadUsuarios() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/usuarios");
      if (!res.ok) throw new Error("No se pudieron cargar los usuarios.");
      setUsuarios(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsuarios();
  }, []);

  const filtrados = usuarios.filter((u) => {
    if (
      searchTerm &&
      !u.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(u.nombre_completo && u.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false;
    }
    
    if (selectedLetter !== "0-9") {
      const inicial = (u.nombre_completo || u.username).trim().charAt(0).toLowerCase();
      if (inicial !== selectedLetter) return false;
    }
    
    return true;
  });

  const columns: Column<Usuario>[] = [
    { key: "username", header: "Usuario", render: (u) => <span style={{ fontWeight: 600 }}>{u.username}</span> },
    {
      key: "nombre_completo",
      header: "Nombre completo",
      render: (u) => u.nombre_completo || <span style={{ color: "var(--text-secondary)" }}>—</span>,
    },
    {
      key: "created_at",
      header: "Fecha de creación",
      render: (u) => new Date(u.created_at).toLocaleDateString(),
    },
  ];

  const actions: ModuleAction[] = [
    { key: "nuevo-usuario", label: "Nuevo Usuario", icon: UserPlus, tone: "primary", onClick: () => setView({ mode: "form" }) },
  ];

  const sidebarContent = (
    <>
      {adminNavContent}
      <FilterSection title="Acciones">
        <ModuleActions actions={actions} variant="sidebar" />
      </FilterSection>
    </>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      <FilterLayout
        errorBanner={error ? <p className={fieldStyles.errorBanner}>{error}</p> : null}
        sidebarContent={sidebarContent}
        selectedLetter={selectedLetter}
        onLetterSelect={setSelectedLetter}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por usuario o nombre..."
      >
        <div style={{ padding: "16px", height: "100%", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <UserCog size={24} style={{ color: "var(--accent-color)" }} />
            <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Usuarios del Sistema</h1>
          </div>

          <DataTable
            data={filtrados}
            columns={columns}
            onRowClick={(usuario) => setView({ mode: "form", usuario })}
            emptyMessage={loading ? "Cargando usuarios..." : "No hay usuarios registrados."}
          />
        </div>
      </FilterLayout>

      {view.mode === "form" && (
        <UsuarioForm
          usuario={view.usuario}
          onCancel={() => setView({ mode: "list" })}
          onSaved={() => {
            setView({ mode: "list" });
            loadUsuarios();
          }}
        />
      )}
    </div>
  );
}
