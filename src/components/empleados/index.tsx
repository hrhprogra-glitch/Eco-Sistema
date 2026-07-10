"use client";

import { useEffect, useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { getApp } from "@/components/lib/apps";
import { EmpleadosCatalog } from "./components/EmpleadosCatalog";
import { EmpleadoDetailView } from "./components/EmpleadoDetailView";
import type { Empleado } from "./types";

const app = getApp("empleados")!;

type Vista = "lista" | "detalle";

function createEmptyEmpleado(): Empleado {
  return {
    id: "",
    nombre: "",
    puesto: "",
    area: "",
    foto_url: null,
    email_trabajo: null,
    telefono_trabajo: null,
    jefe_directo: null,
    dni: null,
    dni_foto_url: null,
    monto_pago: 0,
    created_at: new Date().toISOString(),
  };
}

export default function EmpleadosModule() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState<Vista>("lista");
  const [activeEmpleado, setActiveEmpleado] = useState<Empleado | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchEmpleados = async () => {
    setLoading(true);
    const res = await fetch("/api/empleados");
    if (res.ok) {
      setEmpleados(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  function handleNuevo() {
    setActiveEmpleado(createEmptyEmpleado());
    setIsCreating(true);
    setVista("detalle");
  }

  function handleEditar(empleado: Empleado) {
    setActiveEmpleado(empleado);
    setIsCreating(false);
    setVista("detalle");
  }

  function handleVolver() {
    setActiveEmpleado(null);
    setIsCreating(false);
    setVista("lista");
  }

  async function handleGuardar(empleado: Empleado) {
    setIsSaving(true);
    const res = isCreating
      ? await fetch("/api/empleados", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(empleado),
        })
      : await fetch(`/api/empleados/${empleado.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(empleado),
        });

    if (res.ok) {
      await fetchEmpleados();
      handleVolver();
    }
    setIsSaving(false);
  }

  async function handleEliminar(empleado: Empleado) {
    setIsSaving(true);
    const res = await fetch(`/api/empleados/${empleado.id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchEmpleados();
      handleVolver();
    }
    setIsSaving(false);
  }

  return (
    <ModuleLayout app={app}>
      {loading ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)" }}>
          Cargando empleados...
        </div>
      ) : vista === "lista" ? (
        <EmpleadosCatalog empleados={empleados} onNuevo={handleNuevo} onEditar={handleEditar} />
      ) : (
        <EmpleadoDetailView
          empleado={activeEmpleado!}
          isNew={isCreating}
          isSaving={isSaving}
          onBack={handleVolver}
          onSave={handleGuardar}
          onDelete={handleEliminar}
        />
      )}
    </ModuleLayout>
  );
}
