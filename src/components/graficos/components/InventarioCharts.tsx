import { Package, PieChart } from "lucide-react";
import { DashboardGrid, dashboardStyles } from "@/components/ui/DashboardGrid";
import { WidgetCard } from "@/components/ui/WidgetCard";
import { BarChart } from "./BarChart";
import { DonutChart } from "./DonutChart";
import { GraficosHeader } from "./GraficosHeader";
import { stockPorCategoria, distribucionPorAlmacen } from "../mockGraficos";

export default function InventarioCharts() {
  return (
    <>
      <GraficosHeader title="Inventario" />
      <DashboardGrid>
        <WidgetCard title="Stock por categoría" icon={Package} className={dashboardStyles.colSpan8}>
          <BarChart data={stockPorCategoria} color="#B8860B" />
        </WidgetCard>
        <WidgetCard title="Distribución por almacén" icon={PieChart} className={dashboardStyles.colSpan4}>
          <DonutChart data={distribucionPorAlmacen} />
        </WidgetCard>
      </DashboardGrid>
    </>
  );
}
