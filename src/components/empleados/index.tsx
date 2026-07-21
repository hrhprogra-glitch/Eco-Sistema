"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Plus } from "lucide-react";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import { DataTable, type Column } from "@/components/ui/DataTable";
import fieldStyles from "@/components/ui/formFields.module.css";
import type { Empleado } from "./types";
import { EmpleadoForm } from "./EmpleadoForm";

export default function EmpleadosModule({ adminNavContent }: { adminNavContent?: React.ReactNode }) {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<
    { mode: "list" } | { mode: "form"; empleado?: Empleado }
  >({ mode: "list" });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("0-9");
  const [filterArea, setFilterArea] = useState<string>("todas");

  async function loadEmpleados() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/empleados");
      if (!res.ok) throw new Error("No se pudieron cargar los empleados.");
      setEmpleados(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmpleados();
  }, []);

  const areas = useMemo(() => {
    const unicas = new Set(empleados.map((e) => e.area).filter(Boolean));
    return Array.from(unicas).sort() as string[];
  }, [empleados]);

  const filtrados = empleados.filter((e) => {
    if (filterArea !== "todas" && e.area !== filterArea) return false;
    if (
      searchTerm &&
      !e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !e.puesto.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(e.email_trabajo && e.email_trabajo.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false;
    }
    
    if (selectedLetter !== "0-9") {
      const inicial = e.nombre.trim().charAt(0).toLowerCase();
      if (inicial !== selectedLetter) return false;
    }
    
    return true;
  });

  const columns: Column<Empleado>[] = [
    { key: "nombre", header: "Nombre", render: (e) => <span style={{ fontWeight: 600 }}>{e.nombre}</span> },
    { key: "puesto", header: "Puesto", render: (e) => e.puesto || "—" },
    { key: "area", header: "Área", render: (e) => e.area || "—" },
    {
      key: "telefono_trabajo",
      header: "Teléfono",
      render: (e) => e.telefono_trabajo || <span style={{ color: "var(--text-secondary)" }}>—</span>,
    },
    {
      key: "email_trabajo",
      header: "Email",
      render: (e) => e.email_trabajo || <span style={{ color: "var(--text-secondary)" }}>—</span>,
    },
    {
      key: "jefe_directo",
      header: "Jefe directo",
      render: (e) => e.jefe_directo || <span style={{ color: "var(--text-secondary)" }}>—</span>,
    },
  ];

  const actions: ModuleAction[] = [
    { key: "nuevo-empleado", label: "Nuevo Empleado", icon: Plus, tone: "primary", onClick: () => setView({ mode: "form" }) },
  ];

  const sidebarContent = (
    <>
      {adminNavContent}
      <FilterSection title="Acciones">
        <ModuleActions actions={actions} variant="sidebar" />
      </FilterSection>
      <FilterSection title="Filtros">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label className={fieldStyles.label} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            Área
            <select className={fieldStyles.input} value={filterArea} onChange={(e) => setFilterArea(e.target.value)}>
              <option value="todas">Todas</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </label>
        </div>
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
        searchPlaceholder="Buscar por nombre, puesto o email..."
      >
        <div style={{ padding: "16px", height: "100%", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Users size={24} style={{ color: "var(--accent-color)" }} />
            <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Empleados</h1>
          </div>

          <DataTable
            data={filtrados}
            columns={columns}
            onRowClick={(empleado) => setView({ mode: "form", empleado })}
            emptyMessage={loading ? "Cargando empleados..." : "No hay empleados que coincidan."}
          />
        </div>
      </FilterLayout>

      {view.mode === "form" && (
        <EmpleadoForm
          empleado={view.empleado}
          onCancel={() => setView({ mode: "list" })}
          onSaved={() => {
            setView({ mode: "list" });
            loadEmpleados();
          }}
        />
      )}
    </div>
  );
}
