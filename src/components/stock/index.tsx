"use client";

import { useState } from "react";
import { ProductosCatalogo } from "./components/ProductosCatalogo";
import { StockPorAlmacen } from "./components/StockPorAlmacen";
import styles from "./index.module.css";

export type StockVista = "productos" | "lotes";

export default function StockModule() {
  const [vista, setVista] = useState<StockVista>("productos");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        {vista === "productos" ? (
          <ProductosCatalogo
            vista={vista}
            onCambiarVista={setVista}
            refreshKey={refreshKey}
            onDataChanged={() => setRefreshKey((k) => k + 1)}
          />
        ) : (
          <StockPorAlmacen vista={vista} onCambiarVista={setVista} refreshKey={refreshKey} />
        )}
      </div>
    </div>
  );
}
