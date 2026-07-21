"use client";

import { useEffect, useState } from "react";
import { Package, PieChart, Warehouse, PackageCheck, Wallet, AlertTriangle, Loader2 } from "lucide-react";
import { DashboardGrid, dashboardStyles } from "@/components/ui/DashboardGrid";
import { WidgetCard } from "@/components/ui/WidgetCard";
import { BarChart } from "./BarChart";
import { DonutChart } from "./DonutChart";
import { StackedBarChart } from "./StackedBarChart";
import { KpiRow } from "@/components/ui/KpiRow";
import type { KpiDatum } from "@/components/ui/KpiTile";
import { EmptyState } from "@/components/EmptyState";
import type { ChartDatum, DonutDatum, StackedSeriesDatum, StackedSeriesLegend } from "../types";

// Datos reales, calculados en /api/graficos/inventario a partir de productos/lotes/almacenes
// -- ver ese archivo para el detalle de qué se sustituyó porque no existe en el esquema
// (p. ej. "stock reservado": este sistema no tiene reservas, así que se adaptó a "bajo el
// límite de stock" y el desglose por almacén pasó de disponible/reservado a categoría).

type ApiKpiValue = { value: string; deltaLabel?: string; trend?: "up" | "down" };

type InventarioResponse = {
  kpis: {
    productosActivos: ApiKpiValue;
    bajoLimite: ApiKpiValue;
    valorInventario: ApiKpiValue;
    stockNegativo: ApiKpiValue;
  };
  stockPorCategoria: ChartDatum[];
  stockPorAlmacen: StackedSeriesDatum[];
  stockLegend: StackedSeriesLegend[];
  distribucionPorAlmacen: DonutDatum[];
};

const KPI_META: Record<keyof InventarioResponse["kpis"], { label: string; icon: KpiDatum["icon"]; color: string }> = {
  productosActivos: { label: "Productos activos", icon: Package, color: "#B8860B" },
  bajoLimite: { label: "Bajo el límite de stock", icon: PackageCheck, color: "#2C5F9E" },
  valorInventario: { label: "Valor de inventario", icon: Wallet, color: "#00838F" },
  stockNegativo: { label: "Líneas con stock negativo", icon: AlertTriangle, color: "#C2185B" },
};

export default function InventarioCharts() {
  const [data, setData] = useState<InventarioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/graficos/inventario");
        if (!res.ok) throw new Error("No se pudieron cargar los datos de inventario.");
        const json = (await res.json()) as InventarioResponse;
        if (!cancelado) setData(json);
      } catch (err) {
        if (!cancelado) setError(err instanceof Error ? err.message : "Error desconocido al cargar inventario.");
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  if (loading) {
    return (
      <EmptyState icon={Loader2} title="Cargando inventario..." description="Calculando stock y almacenes reales." />
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        icon={Package}
        title="No se pudieron cargar los datos"
        description={error ?? "Intenta recargar la página."}
      />
    );
  }

  const kpis: KpiDatum[] = (Object.keys(KPI_META) as (keyof InventarioResponse["kpis"])[]).map((key) => {
    const meta = KPI_META[key];
    const kpi = data.kpis[key];
    return { label: meta.label, icon: meta.icon, color: meta.color, value: kpi.value, deltaLabel: kpi.deltaLabel, trend: kpi.trend };
  });

  return (
    <DashboardGrid>
      <div className={dashboardStyles.colSpan12}>
        <KpiRow items={kpis} />
      </div>

      <WidgetCard title="Stock por categoría" icon={Package} className={dashboardStyles.colSpan8}>
        <BarChart data={data.stockPorCategoria} color="#B8860B" />
      </WidgetCard>
      <WidgetCard title="Distribución del valor por almacén" icon={PieChart} className={dashboardStyles.colSpan4}>
        <DonutChart data={data.distribucionPorAlmacen} />
      </WidgetCard>

      <WidgetCard title="Stock por categoría y almacén" icon={Warehouse} className={dashboardStyles.colSpan12}>
        <StackedBarChart data={data.stockPorAlmacen} legend={data.stockLegend} />
      </WidgetCard>
    </DashboardGrid>
  );
}
