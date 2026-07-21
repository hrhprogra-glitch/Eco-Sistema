"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { FilterLayout } from "@/components/ui/FilterLayout";
import { DataTable, type Column } from "@/components/ui/DataTable";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Usuario } from "@/components/usuarios/types";
import { PermisosForm } from "./PermisosForm";

export default function PermisosUsuariosModule({ adminNavContent }: { adminNavContent?: React.ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<{ mode: "list" } | { mode: "form"; usuario: Usuario }>({ mode: "list" });

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
    { key: "nombre_completo", header: "Nombre", render: (u) => u.nombre_completo || "—" },
    {
      key: "permisos",
      header: "Módulos Asignados",
      render: (u) => {
        const count = Array.isArray(u.permisos) ? u.permisos.length : 0;
        return <span style={{ color: count > 0 ? "var(--accent-color)" : "var(--text-secondary)" }}>{count} accesos</span>;
      },
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      <FilterLayout
        errorBanner={error ? <p className={fieldStyles.errorBanner}>{error}</p> : null}
        sidebarContent={adminNavContent}
        selectedLetter={selectedLetter}
        onLetterSelect={setSelectedLetter}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar usuario por nombre..."
      >
        <div style={{ padding: "16px", height: "100%", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <ShieldCheck size={24} style={{ color: "var(--accent-color)" }} />
            <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Permisos por Usuario</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", marginBottom: "16px", fontSize: "0.9rem" }}>
            Selecciona a un usuario de la lista para restringir o habilitar sus accesos a los distintos módulos del sistema.
          </p>

          <DataTable
            data={filtrados}
            columns={columns}
            onRowClick={(usuario) => setView({ mode: "form", usuario })}
            emptyMessage={loading ? "Cargando usuarios..." : "No hay usuarios registrados."}
          />
        </div>
      </FilterLayout>

      {view.mode === "form" && (
        <PermisosForm
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
