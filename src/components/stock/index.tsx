"use client";

import { useState, useEffect } from "react";
import { ProductosCatalogo } from "./components/ProductosCatalogo";
import { StockPorAlmacen } from "./components/StockPorAlmacen";
import { useSession } from "@/components/session/SessionProvider";
import styles from "./index.module.css";

export type StockVista = "productos" | "lotes";

export default function StockModule() {
  const [vista, setVista] = useState<StockVista>("productos");
  const [refreshKey, setRefreshKey] = useState(0);
  const { permisos } = useSession();

  const vistaActions = [
    { key: "productos" },
    { key: "lotes" }
  ].filter(action => permisos.includes(`stock.${action.key}`));

  useEffect(() => {
    if (vistaActions.length > 0 && !vistaActions.find(a => a.key === vista)) {
      setVista(vistaActions[0].key as StockVista);
    }
  }, [permisos, vista, vistaActions]);

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
