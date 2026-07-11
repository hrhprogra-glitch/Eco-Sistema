import { BarChart3, PieChart, Building2 } from "lucide-react";
import { DashboardGrid, dashboardStyles } from "@/components/ui/DashboardGrid";
import { WidgetCard } from "@/components/ui/WidgetCard";
import { AreaChart } from "./AreaChart";
import { DonutChart } from "./DonutChart";
import { RankedBarList } from "./RankedBarList";
import { KpiRow } from "./KpiRow";
import { GraficosHeader } from "./GraficosHeader";
import {
  analiticaKpis,
  tendenciaGeneral,
  tendenciaPeriodoAnterior,
  distribucionIngresosPorArea,
  mejoresClientesPorFacturacion,
} from "../mockGraficos";

export default function AnaliticaCharts() {
  return (
    <>
      <GraficosHeader title="Analítica" />
      <DashboardGrid>
        <div className={dashboardStyles.colSpan12}>
          <KpiRow items={analiticaKpis} />
        </div>

        <WidgetCard title="Tendencia general (últimos 6 meses)" icon={BarChart3} className={dashboardStyles.colSpan8}>
          <AreaChart data={tendenciaGeneral} compareData={tendenciaPeriodoAnterior} color="#00838F" formatValue={(v) => `$${Math.round(v / 1000)}k`} />
        </WidgetCard>
        <WidgetCard title="Distribución de ingresos por área" icon={PieChart} className={dashboardStyles.colSpan4}>
          <DonutChart data={distribucionIngresosPorArea} />
        </WidgetCard>

        <WidgetCard title="Mejores clientes por facturación" icon={Building2} className={dashboardStyles.colSpan12}>
          <RankedBarList data={mejoresClientesPorFacturacion} color="#00838F" />
        </WidgetCard>
      </DashboardGrid>
    </>
  );
}
