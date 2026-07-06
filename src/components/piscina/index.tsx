"use client";

import { useEffect, useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { getApp } from "@/components/lib/apps";
import type { EventoCalendario, EventoCalendarioInput } from "@/components/calendario/types";
import { PiscinaNav } from "./components/PiscinaNav";
import { PiscinasCatalog } from "./components/PiscinasCatalog";
import { PiscinaDetailView } from "./components/PiscinaDetailView";
import { AlertasMantenimiento } from "./components/AlertasMantenimiento";
import { esEventoProximo, esEventoVencido, tieneAlertaCloro } from "./alertas";
import type { Piscina, PiscinaInput } from "./types";

const app = getApp("piscina")!;

type ContactoOption = { id: number; nombre: string };
type Vista = "piscinas" | "alertas" | "detalle";

export default function PiscinaModule() {
  const [piscinas, setPiscinas] = useState<Piscina[]>([]);
  const [contactos, setContactos] = useState<ContactoOption[]>([]);
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [loading, setLoading] = useState(true);

  const [vista, setVista] = useState<Vista>("piscinas");
  const [activePiscina, setActivePiscina] = useState<Piscina | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [piscinasRes, contactosRes, eventosRes] = await Promise.all([
      fetch("/api/piscinas"),
      fetch("/api/contactos"),
      fetch("/api/calendario"),
    ]);
    if (piscinasRes.ok) setPiscinas(await piscinasRes.json());
    if (contactosRes.ok) setContactos(await contactosRes.json());
    if (eventosRes.ok) setEventos(await eventosRes.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  function handleNuevo() {
    setActivePiscina({
      id: 0,
      contacto_id: 0,
      contacto_nombre: "",
      nombre: "",
      ubicacion: "",
      volumen_m3: 0,
      estado: "operativa",
      nivel_cloro: null,
      notas: "",
      created_at: new Date().toISOString(),
    });
    setIsCreating(true);
    setVista("detalle");
  }

  function handleEditar(piscina: Piscina) {
    setActivePiscina(piscina);
    setIsCreating(false);
    setVista("detalle");
  }

  function handleVolver() {
    setActivePiscina(null);
    setIsCreating(false);
    setVista("piscinas");
  }

  async function handleGuardar(input: PiscinaInput) {
    if (!input.contacto_id) {
      window.alert("Elegí un contacto para esta piscina.");
      return;
    }
    setIsSaving(true);
    const res =
      isCreating || !activePiscina
        ? await fetch("/api/piscinas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          })
        : await fetch(`/api/piscinas/${activePiscina.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          });

    if (res.ok) {
      await fetchAll();
      handleVolver();
    }
    setIsSaving(false);
  }

  async function handleEliminar() {
    if (!activePiscina) return;
    setIsSaving(true);
    const res = await fetch(`/api/piscinas/${activePiscina.id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchAll();
      handleVolver();
    }
    setIsSaving(false);
  }

  async function handleAddEvento(input: EventoCalendarioInput) {
    const res = await fetch("/api/calendario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (res.ok) await fetchAll();
  }

  async function handleDeleteEvento(evento: EventoCalendario) {
    const res = await fetch(`/api/calendario/${evento.id}`, { method: "DELETE" });
    if (res.ok) await fetchAll();
  }

  const alertasCount =
    eventos.filter((e) => e.piscina_id !== null && (esEventoVencido(e) || esEventoProximo(e)))
      .length + piscinas.filter(tieneAlertaCloro).length;

  return (
    <ModuleLayout app={app}>
      {vista !== "detalle" && (
        <PiscinaNav
          vista={vista === "alertas" ? "alertas" : "piscinas"}
          alertasCount={alertasCount}
          onChange={setVista}
        />
      )}

      {loading ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)" }}>
          Cargando piscinas...
        </div>
      ) : vista === "piscinas" ? (
        <PiscinasCatalog piscinas={piscinas} onNuevo={handleNuevo} onEditar={handleEditar} />
      ) : vista === "alertas" ? (
        <AlertasMantenimiento eventos={eventos} piscinas={piscinas} />
      ) : (
        <PiscinaDetailView
          piscina={activePiscina!}
          isNew={isCreating}
          isSaving={isSaving}
          contactos={contactos}
          eventos={eventos.filter((e) => e.piscina_id === activePiscina?.id)}
          onBack={handleVolver}
          onSave={handleGuardar}
          onDelete={!isCreating ? handleEliminar : undefined}
          onAddEvento={handleAddEvento}
          onDeleteEvento={handleDeleteEvento}
        />
      )}
    </ModuleLayout>
  );
}
