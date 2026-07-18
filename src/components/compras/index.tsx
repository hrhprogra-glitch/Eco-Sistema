"use client";

import { useState } from "react";
import ProveedoresModule from "@/components/proveedores";
import { ComprasList } from "./components/ComprasList";
import styles from "./index.module.css";

export type ComprasVista = "compras" | "proveedores";

export default function ComprasModule() {
  const [vista, setVista] = useState<ComprasVista>("compras");

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        {vista === "compras" ? (
          <ComprasList vista={vista} onCambiarVista={setVista} />
        ) : (
          <ProveedoresModule vista={vista} onCambiarVista={setVista} />
        )}
      </div>
    </div>
  );
}
