import { Package, PieChart, Warehouse } from "lucide-react";
import { DashboardGrid, dashboardStyles } from "@/components/ui/DashboardGrid";
import { WidgetCard } from "@/components/ui/WidgetCard";
import { BarChart } from "./BarChart";
import { DonutChart } from "./DonutChart";
import { StackedBarChart } from "./StackedBarChart";
import { KpiRow } from "@/components/ui/KpiRow";
import { inventarioKpis, stockPorCategoria, stockPorAlmacen, stockLegend, distribucionPorAlmacen } from "../mockGraficos";

export default function InventarioCharts() {
  return (
    <DashboardGrid>
      <div className={dashboardStyles.colSpan12}>
        <KpiRow items={inventarioKpis} />
      </div>

      <WidgetCard title="Stock por categoría" icon={Package} className={dashboardStyles.colSpan8}>
        <BarChart data={stockPorCategoria} color="#B8860B" />
      </WidgetCard>
      <WidgetCard title="Distribución por almacén" icon={PieChart} className={dashboardStyles.colSpan4}>
        <DonutChart data={distribucionPorAlmacen} />
      </WidgetCard>

      <WidgetCard title="Stock disponible y reservado por ubicación" icon={Warehouse} className={dashboardStyles.colSpan12}>
        <StackedBarChart data={stockPorAlmacen} legend={stockLegend} />
      </WidgetCard>
    </DashboardGrid>
  );
}
