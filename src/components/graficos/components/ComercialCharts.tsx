"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, Users, PieChart, Receipt, ShoppingCart, Target } from "lucide-react";
import { DashboardGrid, dashboardStyles } from "@/components/ui/DashboardGrid";
import { WidgetCard } from "@/components/ui/WidgetCard";
import { EmptyState } from "@/components/EmptyState";
import fieldStyles from "@/components/ui/formFields.module.css";
import { AreaChart } from "./AreaChart";
import { DonutChart } from "./DonutChart";
import { RankedBarList } from "./RankedBarList";
import { KpiRow } from "@/components/ui/KpiRow";
import type { KpiDatum } from "@/components/ui/KpiTile";
import type { ChartDatum, DonutDatum, RankedDatum } from "../types";

type ApiKpi = { value: string; deltaLabel?: string; trend?: "up" | "down" };

type ComercialResponse = {
  kpis: {
    cotizaciones: ApiKpi;
    confirmadas: ApiKpi;
    ingresos30d: ApiKpi;
    oportunidadesAbiertas: ApiKpi;
  };
  ventasPorMes: ChartDatum[];
  mejoresClientes: RankedDatum[];
  oportunidadesPorEtapa: DonutDatum[];
};

// El ícono/color de cada KPI es visual y no viaja por la API (KpiDatum.icon es un
// componente de React, no serializable en JSON); acá se combina con los valores reales
// que sí vienen del servidor.
const KPI_META: { key: keyof ComercialResponse["kpis"]; label: string; icon: LucideIcon; color: string }[] = [
  { key: "cotizaciones", label: "Cotizaciones", icon: Receipt, color: "#714B67" },
  { key: "confirmadas", label: "Ventas confirmadas", icon: ShoppingCart, color: "#2C5F9E" },
  { key: "ingresos30d", label: "Ingresos (30d)", icon: TrendingUp, color: "#00838F" },
  { key: "oportunidadesAbiertas", label: "Oportunidades abiertas", icon: Target, color: "#B8860B" },
];

export default function ComercialCharts() {
  const [data, setData] = useState<ComercialResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/graficos/comercial");
        if (!res.ok) throw new Error("No se pudieron cargar los datos comerciales.");
        const json = (await res.json()) as ComercialResponse;
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error desconocido.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <EmptyState icon={TrendingUp} title="Cargando datos comerciales..." />;
  }

  if (error || !data) {
    return <p className={fieldStyles.errorBanner}>{error || "No se pudieron cargar los datos comerciales."}</p>;
  }

  const kpiItems: KpiDatum[] = KPI_META.map((meta) => ({
    label: meta.label,
    icon: meta.icon,
    color: meta.color,
    value: data.kpis[meta.key].value,
    deltaLabel: data.kpis[meta.key].deltaLabel,
    trend: data.kpis[meta.key].trend,
  }));

  return (
    <DashboardGrid>
      <div className={dashboardStyles.colSpan12}>
        <KpiRow items={kpiItems} />
      </div>

      <WidgetCard title="Ventas mensuales" icon={TrendingUp} className={dashboardStyles.colSpan8}>
        <AreaChart data={data.ventasPorMes} formatValue={(v) => `$${Math.round(v / 1000)}k`} />
      </WidgetCard>
      <WidgetCard title="Oportunidades por etapa" icon={PieChart} className={dashboardStyles.colSpan4}>
        <DonutChart data={data.oportunidadesPorEtapa} />
      </WidgetCard>

      <WidgetCard title="Mejores clientes por cotizado" icon={Users} className={dashboardStyles.colSpan12}>
        <RankedBarList data={data.mejoresClientes} color="#714B67" />
      </WidgetCard>
    </DashboardGrid>
  );
}
