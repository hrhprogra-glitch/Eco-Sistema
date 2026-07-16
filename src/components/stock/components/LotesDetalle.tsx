"use client";

import { useEffect, useState } from "react";
import { FloatingWindow } from "@/components/ui/FloatingWindow";
import { DataTable, type Column } from "@/components/ui/DataTable";
import type { LoteDetalle } from "../types";

export function LotesDetalle({
  productoId,
  productoNombre,
  onClose,
}: {
  productoId: string;
  productoNombre: string;
  onClose: () => void;
}) {
  const [lotes, setLotes] = useState<LoteDetalle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/stock?producto_id=${productoId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setLotes)
      .catch(() => setLotes([]))
      .finally(() => setLoading(false));
  }, [productoId]);

  const columns: Column<LoteDetalle>[] = [
    { key: "numero_lote", header: "Lote", render: (l) => l.numero_lote || `Lote ${l.id.slice(0, 8)}` },
    { key: "almacen_nombre", header: "Almacén" },
    { key: "cantidad_actual", header: "Cantidad disponible" },
    { key: "costo_unitario", header: "Costo unitario", render: (l) => Number(l.costo_unitario).toFixed(2) },
    { key: "fecha_vencimiento", header: "Vencimiento", render: (l) => l.fecha_vencimiento?.slice(0, 10) || "—" },
  ];

  return (
    <FloatingWindow title={`Lotes de ${productoNombre}`} onClose={onClose} width={720}>
      <DataTable
        data={lotes}
        columns={columns}
        emptyMessage={loading ? "Cargando…" : "No hay lotes con stock disponible."}
      />
    </FloatingWindow>
  );
}
