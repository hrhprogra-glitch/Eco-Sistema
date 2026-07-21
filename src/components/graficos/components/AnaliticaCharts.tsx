"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { BarChart3, PieChart, Building2, TrendingUp, CreditCard, Wallet, Target, Percent, Users, ArrowDownToLine, Package } from "lucide-react";
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

type AnaliticaResponse = {
  kpis: {
    ingresosTotales: ApiKpi;
    gastosTotales: ApiKpi;
    utilidadNeta: ApiKpi;
    oportunidadesAbiertas: ApiKpi;
    margenPromedio: ApiKpi;
    clientesNuevos: ApiKpi;
    cuentasCobrar: ApiKpi;
    inventarioValorizado: ApiKpi;
  };
  tendenciaGeneral: ChartDatum[];
  tendenciaPeriodoAnterior: ChartDatum[];
  tendenciaCompras: ChartDatum[];
  distribucionIngresos: DonutDatum[];
  mejoresClientesPorFacturacion: RankedDatum[];
  productosMasVendidos: RankedDatum[];
  proveedoresPrincipales: RankedDatum[];
};

const KPI_META: { key: keyof AnaliticaResponse["kpis"]; label: string; icon: LucideIcon; color: string }[] = [
  { key: "ingresosTotales", label: "Ingresos totales", icon: TrendingUp, color: "#2C5F9E" },
  { key: "gastosTotales", label: "Gastos totales", icon: CreditCard, color: "#B8860B" },
  { key: "utilidadNeta", label: "Utilidad neta", icon: Wallet, color: "#00838F" },
  { key: "margenPromedio", label: "Margen promedio", icon: Percent, color: "#714B67" },
  { key: "clientesNuevos", label: "Clientes nuevos (30d)", icon: Users, color: "#5580B4" },
  { key: "cuentasCobrar", label: "Cuentas por cobrar", icon: ArrowDownToLine, color: "#C2185B" },
  { key: "inventarioValorizado", label: "Inventario valorizado", icon: Package, color: "#2E7D32" },
  { key: "oportunidadesAbiertas", label: "Oportunidades abiertas", icon: Target, color: "#7EA1CA" },
];

export default function AnaliticaCharts() {
  const [data, setData] = useState<AnaliticaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/graficos/analitica");
        if (!res.ok) throw new Error("No se pudieron cargar los datos analíticos.");
        const json = (await res.json()) as AnaliticaResponse;
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
    return <EmptyState icon={BarChart3} title="Cargando datos analíticos..." />;
  }

  if (error || !data) {
    return <p className={fieldStyles.errorBanner}>{error || "No se pudieron cargar los datos analíticos."}</p>;
  }

  const kpiItems: KpiDatum[] = KPI_META.map((meta) => ({
    label: meta.label,
    icon: meta.icon,
    color: meta.color,
    value: data.kpis[meta.key]?.value || "0",
    deltaLabel: data.kpis[meta.key]?.deltaLabel,
    trend: data.kpis[meta.key]?.trend,
  }));

  return (
    <DashboardGrid>
      <div className={dashboardStyles.colSpan12}>
        <KpiRow items={kpiItems.slice(0, 4)} />
      </div>
      <div className={dashboardStyles.colSpan12}>
        <KpiRow items={kpiItems.slice(4, 8)} />
      </div>

      <WidgetCard title="Ventas vs Compras (últimos 6 meses)" icon={BarChart3} className={dashboardStyles.colSpan8}>
        <AreaChart
          data={data.tendenciaGeneral}
          compareData={data.tendenciaCompras}
          color="#00838F"
          formatValue={(v) => `$${Math.round(v / 1000)}k`}
        />
      </WidgetCard>
      <WidgetCard title="Distribución de ingresos por tipo" icon={PieChart} className={dashboardStyles.colSpan4}>
        <DonutChart data={data.distribucionIngresos} />
      </WidgetCard>

      <WidgetCard title="Productos más vendidos" icon={Package} className={dashboardStyles.colSpan6}>
        <RankedBarList data={data.productosMasVendidos} color="#00838F" />
      </WidgetCard>
      <WidgetCard title="Mejores clientes" icon={Building2} className={dashboardStyles.colSpan6}>
        <RankedBarList data={data.mejoresClientesPorFacturacion} color="#2C5F9E" />
      </WidgetCard>
      
      <WidgetCard title="Proveedores principales (por compras)" icon={Building2} className={dashboardStyles.colSpan12}>
        <RankedBarList data={data.proveedoresPrincipales} color="#B8860B" />
      </WidgetCard>
    </DashboardGrid>
  );
}
