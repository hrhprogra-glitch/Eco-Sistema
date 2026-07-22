"use client";

import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";
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

const DIAS_MS = 24 * 60 * 60 * 1000;

export default function ContactoModule() {
  const [view, setView] = useState<View>({ mode: "list" });
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [empresaFilter, setEmpresaFilter] = useState("Sin seleccionar");
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
    {
      key: "identificaciones",
      header: "RUC / DNI",
      render: (c) => (c.identificaciones?.[0] ? `${c.identificaciones[0].tipo}: ${c.identificaciones[0].numero}` : "—"),
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

    if (empresaFilter !== "Sin seleccionar") {
      const esEmpresa = empresaFilter === "Empresa";
      if (contacto.esEmpresa !== esEmpresa) return false;
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

      <FilterSection title="Tipo">
        {["Sin seleccionar", "Empresa", "Persona natural"].map((opcion) => (
          <label key={opcion} className={styles.radioLabel}>
            <input
              type="checkbox"
              className={styles.radioInput}
              checked={empresaFilter === opcion}
              onChange={() => setEmpresaFilter(opcion)}
            />
            {opcion}
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
      <FilterLayout
        errorBanner={error ? <p className={fieldStyles.errorBanner}>{error}</p> : null}
        sidebarContent={sidebarContent}
        selectedLetter={selectedLetter}
        onLetterSelect={setSelectedLetter}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar cliente…"
      >
        <div style={{ padding: "16px", height: "100%", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Users size={24} style={{ color: "var(--accent-color)" }} />
            <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Clientes y Contactos</h1>
          </div>
          <DataTable
            data={contactosFiltrados}
            columns={columns}
            onRowClick={(contacto) => setView({ mode: "form", contacto })}
            emptyMessage={loading ? "Cargando…" : "No hay clientes que coincidan con el filtro."}
          />
        </div>
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
