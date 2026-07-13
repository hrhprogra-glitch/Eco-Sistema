"use client";

import { useCallback, useEffect, useState } from "react";
import { ModuleRibbon, DEFAULT_GROUPS } from "@/components/ui/ModuleRibbon";
import { DataTable, type Column } from "@/components/ui/DataTable";
import fieldStyles from "@/components/ui/formFields.module.css";
import { PedidoForm } from "./components/PedidoForm";
import type { EstadoPedido, Pedido } from "./types";

type View = { mode: "list" } | { mode: "form"; pedido?: Pedido };

const ESTADO_LABEL: Record<EstadoPedido, string> = {
  pendiente: "Pendiente",
  en_preparacion: "En preparación",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default function PedidosModule() {
  const [view, setView] = useState<View>({ mode: "list" });
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pedidos");
      if (!res.ok) throw new Error("No se pudieron cargar los pedidos.");
      setPedidos(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPedidos();
  }, [loadPedidos]);

  async function openPedido(pedido: Pedido) {
    const res = await fetch(`/api/pedidos/${pedido.id}`);
    if (res.ok) {
      const full = await res.json();
      setView({ mode: "form", pedido: { ...pedido, ...full } });
    } else {
      setView({ mode: "form", pedido });
    }
  }

  const columns: Column<Pedido>[] = [
    { key: "numero", header: "N°" },
    { key: "contacto_nombre", header: "Cliente" },
    { key: "estado", header: "Estado", render: (p) => ESTADO_LABEL[p.estado] },
    { key: "total", header: "Total", render: (p) => Number(p.total).toFixed(2) },
    { key: "fecha", header: "Fecha", render: (p) => p.fecha?.slice(0, 10) },
  ];

  const customRibbon = [
    {
      ...DEFAULT_GROUPS[0],
      buttons: DEFAULT_GROUPS[0].buttons
        .filter((btn) => btn.key === "nuevo")
        .map((btn) => ({ ...btn, onClick: () => setView({ mode: "form" }) })),
    },
  ];

  return (
    <>
      <ModuleRibbon groups={customRibbon} />
      {error && <p className={fieldStyles.errorBanner}>{error}</p>}
      <DataTable
        data={pedidos}
        columns={columns}
        onRowClick={openPedido}
        emptyMessage={loading ? "Cargando…" : "No hay pedidos registrados todavía."}
      />

      {view.mode === "form" && (
        <PedidoForm
          pedido={view.pedido}
          onCancel={() => setView({ mode: "list" })}
          onSaved={() => {
            setView({ mode: "list" });
            loadPedidos();
          }}
          onDeleted={() => {
            setView({ mode: "list" });
            loadPedidos();
          }}
        />
      )}
    </>
  );
}
