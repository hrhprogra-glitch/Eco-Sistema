"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { TrendingUp, Calculator, Package, BarChart3 } from "lucide-react";
import { ModuleTabs } from "@/components/ui/ModuleTabs";
import styles from "./index.module.css";

const TABS = [
  { key: "comercial", label: "Comercial", icon: TrendingUp },
  { key: "finanzas", label: "Finanzas", icon: Calculator },
  { key: "inventario", label: "Inventario", icon: Package },
  { key: "analitica", label: "Analítica", icon: BarChart3 },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const TAB_COMPONENTS: Record<TabKey, React.ComponentType> = {
  comercial: dynamic(() => import("./components/ComercialCharts")),
  finanzas: dynamic(() => import("./components/FinanzasCharts")),
  inventario: dynamic(() => import("./components/InventarioCharts")),
  analitica: dynamic(() => import("./components/AnaliticaCharts")),
};

export default function GraficosModule() {
  const [active, setActive] = useState<TabKey>("comercial");
  const ActiveChart = TAB_COMPONENTS[active];

  return (
    <div className={styles.wrapper}>
      <ModuleTabs tabs={TABS} active={active} onChange={setActive} ariaLabel="Categorías de gráficos" />
      <p className={styles.disclaimer}>
        Datos de ejemplo — se van a reemplazar cuando el área tenga datos reales conectados.
      </p>
      <div className={styles.content}>
        <ActiveChart />
      </div>
    </div>
  );
}
