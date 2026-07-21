"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { TrendingUp, Calculator, Package, BarChart3 } from "lucide-react";
import { ModuleTabs } from "@/components/ui/ModuleTabs";
import styles from "./index.module.css";

import { FilterLayout, FilterSection } from "@/components/ui/FilterLayout";
import { ModuleActions, type ModuleAction } from "@/components/ui/ModuleActions";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("0-9");
  
  const ActiveChart = TAB_COMPONENTS[active];

  const actions: ModuleAction[] = TABS.map((tab) => ({
    key: tab.key,
    label: tab.label,
    icon: tab.icon,
    active: active === tab.key,
    onClick: () => setActive(tab.key),
  }));

  const sidebarContent = (
    <FilterSection title="Categorías">
      <ModuleActions actions={actions} variant="sidebar" />
    </FilterSection>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      <FilterLayout
        sidebarContent={sidebarContent}
        selectedLetter={selectedLetter}
        onLetterSelect={setSelectedLetter}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar en gráficos..."
      >
        <div style={{ padding: "16px", height: "100%", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexShrink: 0 }}>
            <BarChart3 size={24} style={{ color: "var(--accent-color)" }} />
            <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Análisis y Gráficos</h1>
          </div>
          <p className={styles.disclaimer}>
            Datos de ejemplo — se van a reemplazar cuando el área tenga datos reales conectados.
          </p>
          <div className={styles.content}>
            <ActiveChart />
          </div>
        </div>
      </FilterLayout>
    </div>
  );
}
