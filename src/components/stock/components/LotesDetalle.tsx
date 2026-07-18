"use client";

import { useCallback, useEffect, useState } from "react";
import { FloatingWindow } from "@/components/ui/FloatingWindow";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { LoteForm } from "./LoteForm";
import type { Almacen } from "@/components/movimientos/types";
import type { LoteDetalle } from "../types";

type View = { mode: "list" } | { mode: "form"; lote?: LoteDetalle };

export function LotesDetalle({
  productoId,
  productoNombre,
  onClose,
  onCambio,
}: {
  productoId: string;
  productoNombre: string;
  onClose: () => void;
  // Crear/editar/borrar un lote cambia la cantidad agregada del producto -- esto avisa al
  // listado de arriba (StockPorAlmacen) para que se actualice, sin acoplar a cómo lo hace.
  onCambio?: () => void;
}) {
  const [view, setView] = useState<View>({ mode: "list" });
  const [lotes, setLotes] = useState<LoteDetalle[]>([]);
  const [almacenId, setAlmacenId] = useState("");
  const [loading, setLoading] = useState(true);

  const loadLotes = useCallback(() => {
    setLoading(true);
    fetch(`/api/stock?producto_id=${productoId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setLotes)
      .catch(() => setLotes([]))
      .finally(() => setLoading(false));
  }, [productoId]);

  useEffect(() => {
    loadLotes();
  }, [loadLotes]);

  // Solo hay un almacén (ver sql/023_inventario_catalogos.sql): se completa solo con el
  // único que devuelve /api/almacenes, igual que en Compras -- no hace falta elegirlo.
  useEffect(() => {
    fetch("/api/almacenes")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Almacen[]) => setAlmacenId(data[0]?.id ?? ""))
      .catch(() => setAlmacenId(""));
  }, []);

  function alGuardar() {
    setView({ mode: "list" });
    loadLotes();
    onCambio?.();
  }

  const columns: Column<LoteDetalle>[] = [
    { key: "numero_lote", header: "Lote", render: (l) => l.numero_lote || `Lote ${l.id.slice(0, 8)}` },
    { key: "cantidad_inicial", header: "Cantidad inicial" },
    { key: "cantidad_actual", header: "Cantidad disponible" },
    { key: "costo_unitario", header: "Costo unitario", render: (l) => Number(l.costo_unitario).toFixed(2) },
    { key: "fecha_vencimiento", header: "Vencimiento", render: (l) => l.fecha_vencimiento?.slice(0, 10) || "—" },
  ];

  if (view.mode === "form") {
    return (
      <LoteForm
        productoId={productoId}
        almacenId={almacenId}
        lote={view.lote}
        onCancel={() => setView({ mode: "list" })}
        onSaved={alGuardar}
      />
    );
  }

  return (
    <FloatingWindow title={`Lotes de ${productoNombre}`} onClose={onClose} width={760}>
      <DataTable
        data={lotes}
        columns={columns}
        onRowClick={(lote) => setView({ mode: "form", lote })}
        onCreate={almacenId ? () => setView({ mode: "form" }) : undefined}
        createLabel="Agregar lote"
        emptyMessage={loading ? "Cargando…" : "Este producto todavía no tiene ningún lote cargado."}
      />
    </FloatingWindow>
  );
}
