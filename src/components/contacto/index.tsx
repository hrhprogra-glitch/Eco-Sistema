"use client";

import { useEffect, useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { getApp } from "@/components/lib/apps";
import { ContactosKanban } from "./components/ContactosKanban";
import { ContactoDetailView } from "./components/ContactoDetailView";
import { createEmptyContacto } from "./emptyContacto";
import type { Contacto } from "./types";

const app = getApp("contacto")!;

type Vista = "lista" | "detalle";

export default function ContactoModule() {
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState<Vista>("lista");
  const [activeContacto, setActiveContacto] = useState<Contacto | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchContactos = async () => {
    setLoading(true);
    const res = await fetch("/api/contactos");
    if (res.ok) {
      setContactos(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContactos();
  }, []);

  function handleNuevo() {
    setActiveContacto(createEmptyContacto());
    setIsCreating(true);
    setVista("detalle");
  }

  function handleEditar(contacto: Contacto) {
    setActiveContacto(contacto);
    setIsCreating(false);
    setVista("detalle");
  }

  function handleVolver() {
    setActiveContacto(null);
    setIsCreating(false);
    setVista("lista");
  }

  async function handleGuardar(contacto: Contacto) {
    setIsSaving(true);
    const res = isCreating
      ? await fetch("/api/contactos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contacto),
        })
      : await fetch(`/api/contactos/${contacto.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contacto),
        });

    if (res.ok) {
      await fetchContactos();
      handleVolver();
    }
    setIsSaving(false);
  }

  return (
    <ModuleLayout app={app}>
      {loading ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)" }}>
          Cargando contactos...
        </div>
      ) : vista === "lista" ? (
        <ContactosKanban contactos={contactos} onNuevo={handleNuevo} onEditar={handleEditar} />
      ) : (
        <ContactoDetailView
          contacto={activeContacto!}
          isNew={isCreating}
          isSaving={isSaving}
          onBack={handleVolver}
          onSave={handleGuardar}
        />
      )}
    </ModuleLayout>
  );
}
