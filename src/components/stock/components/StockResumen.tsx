"use client";

import { useEffect, useState } from "react";
import { Package, Boxes, AlertTriangle, Wallet } from "lucide-react";
import { KpiRow } from "@/components/ui/KpiRow";
import type { KpiDatum } from "@/components/ui/KpiTile";
import type { Producto } from "@/components/inventario/types";

// Panel de control: resumen de cuánto stock hay ahora mismo, calculado en el cliente a
// partir de /api/productos (no hace falta una API aparte -- son 144 filas, no miles).
export function StockResumen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/productos")
      .then((r) => (r.ok ? r.json() : []))
      .then(setProductos)
      .catch(() => setProductos([]))
      .finally(() => setLoading(false));
  }, []);

  const rastreados = productos.filter((p) => p.rastrear_inventario);
  const totalProductos = productos.length;
  const unidadesTotales = rastreados.reduce((sum, p) => sum + Number(p.stock), 0);
  const bajoLimite = rastreados.filter((p) => Number(p.stock) <= Number(p.limite_stock));
  const valorInventario = rastreados.reduce((sum, p) => sum + Number(p.stock) * Number(p.costo), 0);

  const items: KpiDatum[] = [
    { label: "Productos en catálogo", value: loading ? "…" : String(totalProductos), icon: Package, color: "#38bdf8" },
    { label: "Unidades en stock", value: loading ? "…" : unidadesTotales.toLocaleString("es-PE"), icon: Boxes, color: "#0284c7" },
    {
      label: "Bajo el límite de aviso",
      value: loading ? "…" : String(bajoLimite.length),
      icon: AlertTriangle,
      color: bajoLimite.length > 0 ? "#dc2626" : "#16a34a",
    },
    {
      label: "Valor de inventario (costo)",
      value: loading ? "…" : `S/ ${valorInventario.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Wallet,
      color: "#0891b2",
    },
  ];

  return <KpiRow items={items} />;
}
