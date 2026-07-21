"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Plus } from "lucide-react";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import { DataTable, type Column } from "@/components/ui/DataTable";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Rol } from "./types";
import { RolForm } from "./RolForm";

export default function RolesPermisosModule({ adminNavContent }: { adminNavContent?: React.ReactNode }) {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<{ mode: "list" } | { mode: "form"; rol?: Rol }>({ mode: "list" });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("0-9");

  async function loadRoles() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/roles-permisos");
      if (!res.ok) throw new Error("No se pudieron cargar los roles.");
      setRoles(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoles();
  }, []);

  const filtrados = roles.filter((r) => {
    if (
      searchTerm &&
      !r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(r.descripcion && r.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false;
    }
    
    if (selectedLetter !== "0-9") {
      const inicial = r.nombre.trim().charAt(0).toLowerCase();
      if (inicial !== selectedLetter) return false;
    }
    
    return true;
  });

  const columns: Column<Rol>[] = [
    { key: "nombre", header: "Rol", render: (r) => <span style={{ fontWeight: 600 }}>{r.nombre}</span> },
    { key: "descripcion", header: "Descripción", render: (r) => r.descripcion || "—" },
    {
      key: "permisos",
      header: "Permisos Asignados",
      render: (r) => {
        let count = 0;
        if (r.permisos && typeof r.permisos === "object") {
          count = Object.values(r.permisos).filter(Boolean).length;
        }
        return `${count} permisos`;
      },
    },
  ];

  const actions: ModuleAction[] = [
    { key: "nuevo-rol", label: "Nuevo Rol", icon: Plus, tone: "primary", onClick: () => setView({ mode: "form" }) },
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
        searchPlaceholder="Buscar por nombre o descripción..."
      >
        <div style={{ padding: "16px", height: "100%", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <ShieldCheck size={24} style={{ color: "var(--accent-color)" }} />
            <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Roles y Permisos</h1>
          </div>

          <DataTable
            data={filtrados}
            columns={columns}
            onRowClick={(rol) => setView({ mode: "form", rol })}
            emptyMessage={loading ? "Cargando roles..." : "No hay roles que coincidan."}
          />
        </div>
      </FilterLayout>

      {view.mode === "form" && (
        <RolForm
          rol={view.rol}
          onCancel={() => setView({ mode: "list" })}
          onSaved={() => {
            setView({ mode: "list" });
            loadRoles();
          }}
        />
      )}
    </div>
  );
}
