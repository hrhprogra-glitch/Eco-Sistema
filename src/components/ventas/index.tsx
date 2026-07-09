"use client";

import { useEffect, useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { getApp } from "@/components/lib/apps";
import { VentasCatalog } from "./components/VentasCatalog";
import { VentaDetailView } from "./components/VentaDetailView";
import type { Venta, VentaInput } from "./types";
import type { Producto } from "@/components/inventario/types";

const app = getApp("ventas")!;

type ContactoOption = { id: number; nombre: string };
type Vista = "ventas" | "detalle";

export default function VentasModule() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [contactos, setContactos] = useState<ContactoOption[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  const [vista, setVista] = useState<Vista>("ventas");
  const [activeVenta, setActiveVenta] = useState<Venta | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [ventasRes, contactosRes, productosRes] = await Promise.all([
      fetch("/api/ventas"),
      fetch("/api/contactos"),
      fetch("/api/productos"),
    ]);
    if (ventasRes.ok) setVentas(await ventasRes.json());
    if (contactosRes.ok) setContactos(await contactosRes.json());
    if (productosRes.ok) setProductos(await productosRes.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  function handleNuevo() {
    setActiveVenta({
      id: 0,
      contacto_id: 0,
      total: 0,
      estado: "borrador",
      fecha: new Date().toISOString().split("T")[0],
      notas: "",
      created_at: new Date().toISOString(),
      lineas: [],
    });
    setIsCreating(true);
    setVista("detalle");
  }

  async function handleEditar(ventaResumen: Venta) {
    // Fetch full venta details including lines
    const res = await fetch(`/api/ventas/${ventaResumen.id}`);
    if (res.ok) {
      const fullVenta = await res.json();
      setActiveVenta(fullVenta);
      setIsCreating(false);
      setVista("detalle");
    }
  }

  function handleVolver() {
    setActiveVenta(null);
    setIsCreating(false);
    setVista("ventas");
  }

  async function handleGuardar(input: VentaInput) {
    if (!input.contacto_id) {
      window.alert("Elegí un cliente para esta venta.");
      return;
    }
    
    // Ensure total is calculated correctly
    const calculatedTotal = (input.lineas || []).reduce((acc, linea) => acc + (linea.subtotal || 0), 0);
    input.total = calculatedTotal;

    setIsSaving(true);
    const res =
      isCreating || !activeVenta
        ? await fetch("/api/ventas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          })
        : await fetch(`/api/ventas/${activeVenta.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          });

    if (res.ok) {
      await fetchAll();
      handleVolver();
    } else {
      window.alert("Ocurrió un error al guardar la venta.");
    }
    setIsSaving(false);
  }

  async function handleEliminar() {
    if (!activeVenta) return;
    setIsSaving(true);
    const res = await fetch(`/api/ventas/${activeVenta.id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchAll();
      handleVolver();
    } else {
      window.alert("Ocurrió un error al eliminar la venta.");
    }
    setIsSaving(false);
  }

  return (
    <ModuleLayout app={app}>
      {loading ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)" }}>
          Cargando módulo de ventas...
        </div>
      ) : vista === "ventas" ? (
        <VentasCatalog ventas={ventas} onNuevo={handleNuevo} onEditar={handleEditar} />
      ) : (
        <VentaDetailView
          venta={activeVenta!}
          isNew={isCreating}
          isSaving={isSaving}
          contactos={contactos}
          productos={productos}
          onBack={handleVolver}
          onSave={handleGuardar}
          onDelete={!isCreating ? handleEliminar : undefined}
        />
      )}
    </ModuleLayout>
  );
}
