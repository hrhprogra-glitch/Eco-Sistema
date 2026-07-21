"use client";

import { useEffect, useState } from "react";
import { Calculator, PieChart, CreditCard, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Loader2 } from "lucide-react";
import { DashboardGrid, dashboardStyles } from "@/components/ui/DashboardGrid";
import { WidgetCard } from "@/components/ui/WidgetCard";
import { AreaChart } from "./AreaChart";
import { DonutChart } from "./DonutChart";
import { StackedBarChart } from "./StackedBarChart";
import { KpiRow } from "@/components/ui/KpiRow";
import type { KpiDatum } from "@/components/ui/KpiTile";
import { EmptyState } from "@/components/EmptyState";
import type { ChartDatum, DonutDatum, StackedSeriesDatum, StackedSeriesLegend } from "../types";

// Datos reales, calculados en /api/graficos/finanzas a partir de facturas/factura_pagos
// y gastos -- ver ese archivo para el detalle de qué se sustituyó porque no existe en el
// esquema (p. ej. "cuentas por pagar").

type ApiKpiValue = { value: string; deltaLabel?: string; trend?: "up" | "down" };

type FinanzasResponse = {
  kpis: {
    ingresos: ApiKpiValue;
    cuentasPorCobrar: ApiKpiValue;
    gastos: ApiKpiValue;
    gastosPendientes: ApiKpiValue;
  };
  facturadoMensual: ChartDatum[];
  gastosPorCategoriaMensual: StackedSeriesDatum[];
  gastosLegend: StackedSeriesLegend[];
  gastosPorCategoria: DonutDatum[];
};

const KPI_META: Record<keyof FinanzasResponse["kpis"], { label: string; icon: KpiDatum["icon"]; color: string }> = {
  ingresos: { label: "Ingresos (30 días)", icon: TrendingUp, color: "#2C5F9E" },
  cuentasPorCobrar: { label: "Cuentas por cobrar", icon: ArrowDownToLine, color: "#00838F" },
  gastos: { label: "Gastos (30 días)", icon: CreditCard, color: "#B8860B" },
  gastosPendientes: { label: "Gastos pendientes de pago", icon: ArrowUpFromLine, color: "#714B67" },
};

export default function FinanzasCharts() {
  const [data, setData] = useState<FinanzasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/graficos/finanzas");
        if (!res.ok) throw new Error("No se pudieron cargar los datos de finanzas.");
        const json = (await res.json()) as FinanzasResponse;
        if (!cancelado) setData(json);
      } catch (err) {
        if (!cancelado) setError(err instanceof Error ? err.message : "Error desconocido al cargar finanzas.");
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
      <EmptyState icon={Loader2} title="Cargando finanzas..." description="Calculando facturación y gastos reales." />
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        icon={Calculator}
        title="No se pudieron cargar los datos"
        description={error ?? "Intenta recargar la página."}
      />
    );
  }

  const kpis: KpiDatum[] = (Object.keys(KPI_META) as (keyof FinanzasResponse["kpis"])[]).map((key) => {
    const meta = KPI_META[key];
    const kpi = data.kpis[key];
    return { label: meta.label, icon: meta.icon, color: meta.color, value: kpi.value, deltaLabel: kpi.deltaLabel, trend: kpi.trend };
  });

  return (
    <DashboardGrid>
      <div className={dashboardStyles.colSpan12}>
        <KpiRow items={kpis} />
      </div>

      <WidgetCard title="Facturado" icon={Calculator} className={dashboardStyles.colSpan8}>
        <AreaChart data={data.facturadoMensual} color="#2C5F9E" formatValue={(v) => `$${Math.round(v / 1000)}k`} />
      </WidgetCard>
      <WidgetCard title="Gastos por categoría" icon={PieChart} className={dashboardStyles.colSpan4}>
        <DonutChart data={data.gastosPorCategoria} />
      </WidgetCard>

      <WidgetCard title="Análisis de gastos" icon={CreditCard} className={dashboardStyles.colSpan12}>
        <StackedBarChart data={data.gastosPorCategoriaMensual} legend={data.gastosLegend} />
      </WidgetCard>
    </DashboardGrid>
  );
}
