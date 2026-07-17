"use client";

import { useState } from "react";
import { Package, Warehouse } from "lucide-react";
import { ModuleTabs } from "@/components/ui/ModuleTabs";
import { StockResumen } from "./components/StockResumen";
import { ProductosCatalogo } from "./components/ProductosCatalogo";
import { StockPorAlmacen } from "./components/StockPorAlmacen";
import styles from "./index.module.css";

const TABS = [
  { key: "productos", label: "Productos", icon: Package },
  { key: "almacenes", label: "Stock por almacén", icon: Warehouse },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function StockModule() {
  const [active, setActive] = useState<TabKey>("productos");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className={styles.wrapper}>
      <ModuleTabs tabs={TABS} active={active} onChange={setActive} ariaLabel="Vistas de Stock" />
      <div className={styles.resumen}>
        <StockResumen key={refreshKey} />
      </div>
      <div className={styles.content}>
        {active === "productos"
          ? <ProductosCatalogo onDataChanged={() => setRefreshKey((k) => k + 1)} />
          : <StockPorAlmacen />}
      </div>
    </div>
  );
}
