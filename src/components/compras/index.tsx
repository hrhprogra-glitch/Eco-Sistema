"use client";

import { useState } from "react";
import { ShoppingCart, Truck } from "lucide-react";
import ProveedoresModule from "@/components/proveedores";
import { ModuleTabs } from "@/components/ui/ModuleTabs";
import { ComprasList } from "./components/ComprasList";
import styles from "./index.module.css";

const TABS = [
  { key: "compras", label: "Compras", icon: ShoppingCart },
  { key: "proveedores", label: "Proveedores", icon: Truck },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ComprasModule() {
  const [active, setActive] = useState<TabKey>("compras");

  return (
    <div className={styles.wrapper}>
      <ModuleTabs tabs={TABS} active={active} onChange={setActive} ariaLabel="Vistas de Compras" />
      <div className={styles.content}>
        {active === "compras" ? <ComprasList /> : <ProveedoresModule />}
      </div>
    </div>
  );
}
