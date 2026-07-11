import { BarChart3, PieChart } from "lucide-react";
import { DashboardGrid, dashboardStyles } from "@/components/ui/DashboardGrid";
import { WidgetCard } from "@/components/ui/WidgetCard";
import { BarChart } from "./BarChart";
import { DonutChart } from "./DonutChart";
import { GraficosHeader } from "./GraficosHeader";
import { distribucionIngresosPorArea, tendenciaGeneral } from "../mockGraficos";

export default function AnaliticaCharts() {
  return (
    <>
      <GraficosHeader title="Analítica" />
      <DashboardGrid>
        <WidgetCard title="Distribución de ingresos por área" icon={PieChart} className={dashboardStyles.colSpan4}>
          <DonutChart data={distribucionIngresosPorArea} />
        </WidgetCard>
        <WidgetCard title="Tendencia general (últimos 6 meses)" icon={BarChart3} className={dashboardStyles.colSpan8}>
          <BarChart data={tendenciaGeneral} color="#00838F" />
        </WidgetCard>
      </DashboardGrid>
    </>
  );
}
