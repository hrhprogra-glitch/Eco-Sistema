"use client";

import { useEffect, useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { getApp } from "@/components/lib/apps";
import { CalendarioGrid } from "./components/CalendarioGrid";
import { DiaPanel } from "./components/DiaPanel";
import type { EstadoEvento, EventoCalendario, EventoCalendarioInput } from "./types";
import styles from "./index.module.css";

const app = getApp("calendario")!;

type ProyectoOption = { id: number; nombre: string };
type PiscinaOption = { id: number; nombre: string; contacto_nombre: string };

function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function CalendarioModule() {
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoOption[]>([]);
  const [piscinas, setPiscinas] = useState<PiscinaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  const fetchAll = async () => {
    setLoading(true);
    const [eventosRes, proyectosRes, piscinasRes] = await Promise.all([
      fetch("/api/calendario"),
      fetch("/api/proyectos"),
      fetch("/api/piscinas"),
    ]);
    if (eventosRes.ok) setEventos(await eventosRes.json());
    if (proyectosRes.ok) setProyectos(await proyectosRes.json());
    if (piscinasRes.ok) setPiscinas(await piscinasRes.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  async function handleCreate(input: EventoCalendarioInput) {
    const res = await fetch("/api/calendario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (res.ok) await fetchAll();
  }

  async function handleUpdateEstado(evento: EventoCalendario, estado: EstadoEvento) {
    const res = await fetch(`/api/calendario/${evento.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: evento.titulo,
        fecha: evento.fecha,
        descripcion: evento.descripcion,
        estado,
        proyecto_id: evento.proyecto_id,
        piscina_id: evento.piscina_id,
      } satisfies EventoCalendarioInput),
    });
    if (res.ok) await fetchAll();
  }

  async function handleDelete(evento: EventoCalendario) {
    const res = await fetch(`/api/calendario/${evento.id}`, { method: "DELETE" });
    if (res.ok) await fetchAll();
  }

  const eventosDelDia = eventos.filter((evento) => evento.fecha === selectedDate);

  return (
    <ModuleLayout app={app}>
      {loading ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)" }}>
          Cargando calendario...
        </div>
      ) : (
        <div className={styles.wrapper}>
          <div className={styles.gridColumn}>
            <CalendarioGrid
              eventos={eventos}
              selectedDate={selectedDate}
              onSelectDay={setSelectedDate}
            />
          </div>
          <div className={styles.panelColumn}>
            <DiaPanel
              fecha={selectedDate}
              eventos={eventosDelDia}
              proyectos={proyectos}
              piscinas={piscinas}
              onCreate={handleCreate}
              onUpdateEstado={handleUpdateEstado}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}
    </ModuleLayout>
  );
}
