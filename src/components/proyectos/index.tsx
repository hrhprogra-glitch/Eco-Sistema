"use client";

import { useEffect, useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { getApp } from "@/components/lib/apps";
import { ProyectosList } from "./components/ProyectosList";
import { ProyectoForm } from "./components/ProyectoForm";
import { ProyectoDetail } from "./components/ProyectoDetail";
import type { Proyecto } from "./types";

const app = getApp("proyectos")!;

type Vista = "lista" | "form" | "detalle";

export default function ProyectosModule() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState<Vista>("lista");
  const [selectedProyectoId, setSelectedProyectoId] = useState<number | null>(null);

  const fetchProyectos = async () => {
    setLoading(true);
    const res = await fetch("/api/proyectos");
    if (res.ok) {
      setProyectos(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProyectos();
  }, []);

  const handleSave = async (data: {
    nombre: string;
    empleados: number[];
    items: { producto_id: number | null; nombre_externo: string | null; cantidad: number; justificacion: string | null }[];
  }) => {
    const res = await fetch("/api/proyectos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const newProj = await res.json();
      await fetchProyectos();
      setSelectedProyectoId(newProj.id);
      setVista("detalle");
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/proyectos/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchProyectos();
      setVista("lista");
      setSelectedProyectoId(null);
    }
  };

  return (
    <ModuleLayout 
      app={app}
      topbarContent={
        <div style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)" }}>
          Gestión de Proyectos
        </div>
      }
    >
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>
          Cargando proyectos...
        </div>
      ) : vista === "lista" ? (
        <ProyectosList 
          proyectos={proyectos} 
          onCreate={() => setVista("form")}
          onSelect={(p) => {
            setSelectedProyectoId(p.id);
            setVista("detalle");
          }}
        />
      ) : vista === "form" ? (
        <ProyectoForm 
          onSave={handleSave} 
          onCancel={() => setVista("lista")} 
        />
      ) : (
        selectedProyectoId && (
          <ProyectoDetail 
            proyectoId={selectedProyectoId} 
            onBack={() => {
              setVista("lista");
              fetchProyectos(); // Refresh in case stock was deducted
            }}
            onDeleteProject={handleDelete}
          />
        )
      )}
    </ModuleLayout>
  );
}

