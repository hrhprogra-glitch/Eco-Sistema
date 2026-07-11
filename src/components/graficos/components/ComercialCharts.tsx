import { TrendingUp, PieChart } from "lucide-react";
import { DashboardGrid, dashboardStyles } from "@/components/ui/DashboardGrid";
import { WidgetCard } from "@/components/ui/WidgetCard";
import { BarChart } from "./BarChart";
import { DonutChart } from "./DonutChart";
import { GraficosHeader } from "./GraficosHeader";
import { ventasPorMes, oportunidadesPorEtapa } from "../mockGraficos";

export default function ComercialCharts() {
  return (
    <>
      <GraficosHeader title="Comercial" />
      <DashboardGrid>
        <WidgetCard title="Ventas por mes" icon={TrendingUp} className={dashboardStyles.colSpan8}>
          <BarChart data={ventasPorMes} color="#714B67" />
        </WidgetCard>
        <WidgetCard title="Oportunidades por etapa" icon={PieChart} className={dashboardStyles.colSpan4}>
          <DonutChart data={oportunidadesPorEtapa} />
        </WidgetCard>
      </DashboardGrid>
    </>
  );
}
