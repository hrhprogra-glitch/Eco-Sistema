"use client";

import { useEffect, useState } from "react";
import { Waves, Plus } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import type { Piscina } from "../types";
import { PiscinaForm } from "./PiscinaForm";

import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";

export function PiscinasVista({ 
  piscinaNavContent 
}: { 
  piscinaNavContent?: React.ReactNode;
}) {
  const [piscinas, setPiscinas] = useState<Piscina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [view, setView] = useState<{ mode: "list" } | { mode: "form"; piscina?: Piscina }>({ mode: "list" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("0-9");

  async function loadPiscinas() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/piscinas");
      if (!res.ok) throw new Error("No se pudieron cargar las piscinas.");
      setPiscinas(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPiscinas();
  }, []);



  const columns: Column<Piscina>[] = [
    { key: "nombre", header: "Piscina", render: (p) => <span style={{ fontWeight: 600 }}>{p.nombre}</span> },
    { key: "contacto_nombre", header: "Cliente / Propietario" },
    { key: "ubicacion", header: "Ubicación", render: (p) => p.ubicacion || "—" },
    { key: "frecuencia", header: "Frecuencia", render: (p) => p.frecuencia.charAt(0).toUpperCase() + p.frecuencia.slice(1) },
    { key: "precio_mantenimiento", header: "Precio Mantenimiento", render: (p) => `$ ${Number(p.precio_mantenimiento).toFixed(2)}` },
    { 
      key: "estado", 
      header: "Estado",
      render: (p) => (
        <span style={{ 
          color: p.estado === "operativa" ? "var(--status-success)" : 
                 p.estado === "mantenimiento" ? "var(--status-warning)" : "var(--status-error)"
        }}>
          {p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
        </span>
      )
    },
  ];

  const filtrados = piscinas.filter(p => {
    if (searchTerm) {
      const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.contacto_nombre && p.contacto_nombre.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matchesSearch) return false;
    }

    if (selectedLetter !== "0-9") {
      const inicial = p.nombre.trim().charAt(0).toLowerCase();
      if (inicial !== selectedLetter) return false;
    }

    return true;
  });

  const actions: ModuleAction[] = [
    { key: "nuevo", label: "Nueva Piscina", icon: Plus, tone: "primary", onClick: () => setView({ mode: "form" }) },
  ];

  const sidebarContent = (
    <>
      {piscinaNavContent}
      <FilterSection title="Acciones">
        <ModuleActions actions={actions} variant="sidebar" />
      </FilterSection>
    </>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      <FilterLayout
        errorBanner={error ? <p style={{ color: "var(--status-error)", padding: "12px", background: "var(--surface-error)", borderRadius: "8px", margin: "16px" }}>{error}</p> : null}
        sidebarContent={sidebarContent}
        selectedLetter={selectedLetter}
        onLetterSelect={setSelectedLetter}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nombre o cliente..."
      >
        <div style={{ padding: "16px", height: "100%", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Waves size={24} style={{ color: "var(--accent-color)" }} />
            <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Registro de Piscinas</h1>
          </div>
          
          <DataTable
            data={filtrados}
            columns={columns}
            onRowClick={(piscina) => setView({ mode: "form", piscina })}
            emptyMessage={loading ? "Cargando piscinas..." : "No hay piscinas registradas."}
          />
        </div>
      </FilterLayout>

      {view.mode === "form" && (
        <PiscinaForm
          piscina={view.piscina}
          onCancel={() => setView({ mode: "list" })}
          onSaved={() => {
            setView({ mode: "list" });
            loadPiscinas();
          }}
        />
      )}
    </div>
  );
}
