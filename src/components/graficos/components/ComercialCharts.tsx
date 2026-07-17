import { TrendingUp, Users, PieChart } from "lucide-react";
import { DashboardGrid, dashboardStyles } from "@/components/ui/DashboardGrid";
import { WidgetCard } from "@/components/ui/WidgetCard";
import { AreaChart } from "./AreaChart";
import { DonutChart } from "./DonutChart";
import { RankedBarList } from "./RankedBarList";
import { KpiRow } from "@/components/ui/KpiRow";
import { comercialKpis, ventasPorMes, mejoresVendedoresPorIngresos, oportunidadesPorEtapa } from "../mockGraficos";

export default function ComercialCharts() {
  return (
    <DashboardGrid>
      <div className={dashboardStyles.colSpan12}>
        <KpiRow items={comercialKpis} />
      </div>

      <WidgetCard title="Ventas mensuales" icon={TrendingUp} className={dashboardStyles.colSpan8}>
        <AreaChart data={ventasPorMes} formatValue={(v) => `$${Math.round(v / 1000)}k`} />
      </WidgetCard>
      <WidgetCard title="Oportunidades por etapa" icon={PieChart} className={dashboardStyles.colSpan4}>
        <DonutChart data={oportunidadesPorEtapa} />
      </WidgetCard>

      <WidgetCard title="Mejores vendedores por ingresos" icon={Users} className={dashboardStyles.colSpan12}>
        <RankedBarList data={mejoresVendedoresPorIngresos} color="#714B67" />
      </WidgetCard>
    </DashboardGrid>
  );
}
