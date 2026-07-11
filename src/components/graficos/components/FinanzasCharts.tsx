import { Calculator, PieChart } from "lucide-react";
import { DashboardGrid, dashboardStyles } from "@/components/ui/DashboardGrid";
import { WidgetCard } from "@/components/ui/WidgetCard";
import { BarChart } from "./BarChart";
import { DonutChart } from "./DonutChart";
import { GraficosHeader } from "./GraficosHeader";
import { ingresosPorMes, gastosPorCategoria } from "../mockGraficos";

export default function FinanzasCharts() {
  return (
    <>
      <GraficosHeader title="Finanzas" />
      <DashboardGrid>
        <WidgetCard title="Ingresos por mes" icon={Calculator} className={dashboardStyles.colSpan8}>
          <BarChart data={ingresosPorMes} color="#2C5F9E" />
        </WidgetCard>
        <WidgetCard title="Gastos por categoría" icon={PieChart} className={dashboardStyles.colSpan4}>
          <DonutChart data={gastosPorCategoria} />
        </WidgetCard>
      </DashboardGrid>
    </>
  );
}
