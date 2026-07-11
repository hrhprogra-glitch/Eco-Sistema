import { Calculator, PieChart, CreditCard } from "lucide-react";
import { DashboardGrid, dashboardStyles } from "@/components/ui/DashboardGrid";
import { WidgetCard } from "@/components/ui/WidgetCard";
import { AreaChart } from "./AreaChart";
import { DonutChart } from "./DonutChart";
import { StackedBarChart } from "./StackedBarChart";
import { KpiRow } from "./KpiRow";
import { GraficosHeader } from "./GraficosHeader";
import { finanzasKpis, facturadoMensual, gastosPorCategoriaMensual, gastosLegend, gastosPorCategoria } from "../mockGraficos";

export default function FinanzasCharts() {
  return (
    <>
      <GraficosHeader title="Finanzas" />
      <DashboardGrid>
        <div className={dashboardStyles.colSpan12}>
          <KpiRow items={finanzasKpis} />
        </div>

        <WidgetCard title="Facturado" icon={Calculator} className={dashboardStyles.colSpan8}>
          <AreaChart data={facturadoMensual} color="#2C5F9E" formatValue={(v) => `$${Math.round(v / 1000)}k`} />
        </WidgetCard>
        <WidgetCard title="Gastos por categoría" icon={PieChart} className={dashboardStyles.colSpan4}>
          <DonutChart data={gastosPorCategoria} />
        </WidgetCard>

        <WidgetCard title="Análisis de gastos" icon={CreditCard} className={dashboardStyles.colSpan12}>
          <StackedBarChart data={gastosPorCategoriaMensual} legend={gastosLegend} />
        </WidgetCard>
      </DashboardGrid>
    </>
  );
}
