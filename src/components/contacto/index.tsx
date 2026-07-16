"use client";

import { useCallback, useEffect, useState } from "react";
import { ModuleActions } from "@/components/ui/ModuleActions";
import { buildComercialActions } from "@/components/comercial/comercialActions";
import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
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

const ESTADOS_TIPO: Record<string, Contacto["tipo"]> = {
  Cliente: "cliente",
  Proveedor: "proveedor",
  Otro: "otro",
};

const DIAS_MS = 24 * 60 * 60 * 1000;

export default function ContactoModule() {
  const [view, setView] = useState<View>({ mode: "list" });
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipoFilter, setTipoFilter] = useState("Sin seleccionar");
  const [recienteFilter, setRecienteFilter] = useState("todos");
  const [selectedLetter, setSelectedLetter] = useState("0-9");
  const [searchTerm, setSearchTerm] = useState("");

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

  const columns: Column<Contacto>[] = [
    {
      key: "nombre",
      header: "Nombre",
      render: (c) => <span style={{ color: "var(--accent-text)", fontWeight: 600 }}>{c.nombre}</span>,
    },
    { key: "telefono", header: "Teléfono" },
    { key: "email", header: "E-mail" },
    { key: "movil", header: "Móvil" },
    { key: "direccion", header: "Dirección", render: (c) => c.direccion?.calle || "—" },
    { key: "personaContacto", header: "Persona de contacto" },
    {
      key: "tipoCliente",
      header: "Tipo de cliente",
      render: (c) => <Badge variant={c.tipo}>{c.tipoCliente || TIPO_LABEL[c.tipo]}</Badge>,
    },
  ];

  const handleCreate = () => setView({ mode: "form" });

  const contactosFiltrados = contactos.filter((contacto) => {
    if (searchTerm.trim()) {
      const termino = searchTerm.trim().toLowerCase();
      const coincide = [contacto.nombre, contacto.telefono, contacto.email, contacto.movil, contacto.personaContacto]
        .some((campo) => campo?.toLowerCase().includes(termino));
      if (!coincide) return false;
    }

    if (selectedLetter !== "0-9") {
      const inicial = contacto.nombre.trim().charAt(0).toLowerCase();
      if (inicial !== selectedLetter) return false;
    }

    if (tipoFilter !== "Sin seleccionar" && contacto.tipo !== ESTADOS_TIPO[tipoFilter]) {
      return false;
    }

    if (recienteFilter !== "todos") {
      const antiguedadMs = Date.now() - new Date(contacto.created_at).getTime();
      if (recienteFilter === "hoy" && antiguedadMs > DIAS_MS) return false;
      if (recienteFilter === "semana" && antiguedadMs > DIAS_MS * 7) return false;
      if (recienteFilter === "mes" && antiguedadMs > DIAS_MS * 30) return false;
    }

    return true;
  });

  const actions = buildComercialActions("contacto", handleCreate);

  const sidebarContent = (
    <>
      <FilterSection title="Acciones">
        <ModuleActions actions={actions} variant="sidebar" />
      </FilterSection>

      <FilterSection title="Estados">
        {["Sin seleccionar", "Cliente", "Proveedor", "Otro"].map((estado) => (
          <label key={estado} className={styles.radioLabel}>
            <input
              type="checkbox"
              className={styles.radioInput}
              checked={tipoFilter === estado}
              onChange={() => setTipoFilter(estado)}
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
      {error && <p className={fieldStyles.errorBanner}>{error}</p>}
      
      <FilterLayout
        sidebarContent={sidebarContent}
        selectedLetter={selectedLetter}
        onLetterSelect={setSelectedLetter}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar cliente…"
      >
        <DataTable
          data={contactosFiltrados}
          columns={columns}
          onRowClick={(contacto) => setView({ mode: "form", contacto })}
          emptyMessage={loading ? "Cargando…" : "No hay clientes que coincidan con el filtro."}
        />
      </FilterLayout>

      {view.mode === "form" && (
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
      )}
    </div>
  );
}
