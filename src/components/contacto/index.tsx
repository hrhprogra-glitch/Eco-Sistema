"use client";

import { useCallback, useEffect, useState } from "react";
import { ModuleRibbon, DEFAULT_GROUPS } from "@/components/ui/ModuleRibbon";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import { DataTable, type Column } from "@/components/ui/DataTable";
import fieldStyles from "@/components/ui/formFields.module.css";
import styles from "@/components/ui/FilterLayout.module.css";
import { ContactoForm } from "./components/ContactoForm";
import type { Contacto } from "./types";

type View = { mode: "list" } | { mode: "form"; contacto?: Contacto };

const TIPO_LABEL: Record<Contacto["tipo"], string> = {
  cliente: "Cliente",
  proveedor: "Proveedor",
  otro: "Otro",
};

export default function ContactoModule() {
  const [view, setView] = useState<View>({ mode: "list" });
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContactos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contactos");
      if (!res.ok) throw new Error("No se pudieron cargar los clientes.");
      setContactos(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContactos();
  }, [loadContactos]);

  if (view.mode === "form") {
    return (
      <>
        <ModuleRibbon />
        <ContactoForm
          contacto={view.contacto}
          onCancel={() => setView({ mode: "list" })}
          onSaved={() => {
            setView({ mode: "list" });
            loadContactos();
          }}
          onDeleted={() => {
            setView({ mode: "list" });
            loadContactos();
          }}
        />
      </>
    );
  }

  const columns: Column<Contacto>[] = [
    { key: "codigo", header: "Código" },
    { key: "nombreFiscal", header: "Nombre Fiscal" },
    { key: "telefono", header: "Teléfono" },
    { key: "fax", header: "Fax" },
    { key: "email", header: "E-mail" },
    { key: "movil", header: "Móvil" },
    { key: "personaContacto", header: "Persona de Contacto" },
    { key: "nif", header: "N.I.F." },
    { key: "agente", header: "Agente" },
    { key: "tipoCliente", header: "Tipo de Cliente", render: (c) => c.tipoCliente || TIPO_LABEL[c.tipo] },
  ];

  const handleCreate = () => setView({ mode: "form" });

  const customRibbon = [
    {
      ...DEFAULT_GROUPS[0],
      buttons: DEFAULT_GROUPS[0].buttons.map(btn => 
        btn.key === "nuevo" ? { ...btn, onClick: handleCreate } : btn
      )
    },
    ...DEFAULT_GROUPS.slice(1)
  ];

  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [recienteFilter, setRecienteFilter] = useState("todos");
  const [selectedLetter, setSelectedLetter] = useState("0-9");

  const sidebarContent = (
    <>
      <FilterSection title="Estados">
        {["Sin seleccionar", "Habitual", "Esporádico", "Baja", "Captación"].map((estado) => (
          <label key={estado} className={styles.radioLabel}>
            <input 
              type="checkbox" 
              className={styles.radioInput}
              checked={estadoFilter === estado}
              onChange={() => setEstadoFilter(estado)}
            />
            {estado}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Recientes">
        {[
          { id: "todos", label: "Todos" },
          { id: "hoy", label: "Creados hoy" },
          { id: "semana", label: "La última semana" },
          { id: "mes", label: "El último mes" }
        ].map((opcion) => (
          <label key={opcion.id} className={styles.radioLabel}>
            <input 
              type="radio" 
              name="reciente"
              className={styles.radioInput}
              checked={recienteFilter === opcion.id}
              onChange={() => setRecienteFilter(opcion.id)}
            />
            {opcion.label}
          </label>
        ))}
      </FilterSection>
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0 }}>
      <ModuleRibbon groups={customRibbon} />
      {error && <p className={fieldStyles.errorBanner}>{error}</p>}
      
      <FilterLayout 
        sidebarContent={sidebarContent}
        selectedLetter={selectedLetter}
        onLetterSelect={setSelectedLetter}
      >
        <DataTable
          data={contactos}
          columns={columns}
          onRowClick={(contacto) => setView({ mode: "form", contacto })}
          emptyMessage={loading ? "Cargando…" : "No hay clientes cargados todavía."}
        />
      </FilterLayout>
    </div>
  );
}
