"use client";

import { useCallback, useEffect, useState } from "react";
import { ShoppingCart, Truck, UserPlus } from "lucide-react";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import fieldStyles from "@/components/ui/formFields.module.css";
import { ProveedorForm } from "./components/ProveedorForm";
import type { Proveedor } from "./types";
import type { ComprasVista } from "@/components/compras";

type View = { mode: "list" } | { mode: "form"; proveedor?: Proveedor };

export default function ProveedoresModule({
  vista,
  onCambiarVista,
}: {
  vista?: ComprasVista;
  onCambiarVista?: (vista: ComprasVista) => void;
}) {
  const [view, setView] = useState<View>({ mode: "list" });
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("0-9");

  const loadProveedores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/proveedores");
      if (!res.ok) throw new Error("No se pudieron cargar los proveedores.");
      setProveedores(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProveedores();
  }, [loadProveedores]);

  const columns: Column<Proveedor>[] = [
    { key: "nombre", header: "Nombre", render: (p) => <span style={{ color: "var(--accent-text)", fontWeight: 600 }}>{p.nombre}</span> },
    { key: "ruc", header: "RUC", render: (p) => p.ruc || "—" },
    { key: "contacto", header: "Contacto", render: (p) => p.contacto || "—" },
    { key: "telefono", header: "Teléfono", render: (p) => p.telefono || "—" },
    { key: "email", header: "E-mail", render: (p) => p.email || "—" },
  ];

  const actions: ModuleAction[] = [
    { key: "nuevo", label: "Nuevo proveedor", icon: UserPlus, tone: "primary", onClick: () => setView({ mode: "form" }) },
  ];

  const vistaActions: ModuleAction[] = onCambiarVista
    ? [
        { key: "compras", label: "Compras", icon: ShoppingCart, active: vista === "compras", onClick: () => onCambiarVista("compras") },
        { key: "proveedores", label: "Proveedores", icon: Truck, active: vista === "proveedores", onClick: () => onCambiarVista("proveedores") },
      ]
    : [];

  const proveedoresFiltrados = proveedores.filter((proveedor) => {
    if (searchTerm.trim()) {
      const termino = searchTerm.trim().toLowerCase();
      const coincide = [proveedor.nombre, proveedor.ruc, proveedor.contacto, proveedor.email]
        .some((campo) => campo?.toLowerCase().includes(termino));
      if (!coincide) return false;
    }

    if (selectedLetter !== "0-9") {
      const inicial = proveedor.nombre.trim().charAt(0).toLowerCase();
      if (inicial !== selectedLetter) return false;
    }

    return true;
  });

  const sidebarContent = (
    <>
      {vistaActions.length > 0 && (
        <FilterSection title="Vista">
          <ModuleActions actions={vistaActions} variant="sidebar" />
        </FilterSection>
      )}
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
        searchPlaceholder="Buscar proveedor…"
      >
        <div style={{ padding: "16px", height: "100%", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Truck size={24} style={{ color: "var(--accent-color)" }} />
            <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Proveedores</h1>
          </div>
          <DataTable
            data={proveedoresFiltrados}
            columns={columns}
            onRowClick={(proveedor) => setView({ mode: "form", proveedor })}
            emptyMessage={loading ? "Cargando…" : "No hay proveedores que coincidan con el filtro."}
          />
        </div>
      </FilterLayout>

      {view.mode === "form" && (
        <ProveedorForm
          proveedor={view.proveedor}
          onCancel={() => setView({ mode: "list" })}
          onSaved={() => {
            setView({ mode: "list" });
            loadProveedores();
          }}
          onDeleted={() => {
            setView({ mode: "list" });
            loadProveedores();
          }}
        />
      )}
    </div>
  );
}
