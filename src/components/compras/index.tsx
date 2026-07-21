"use client";
import { useState, useEffect } from "react";
import ProveedoresModule from "@/components/proveedores";
import { ComprasList } from "./components/ComprasList";
import { useSession } from "@/components/session/SessionProvider";
import styles from "./index.module.css";

export type ComprasVista = "compras" | "proveedores";

export default function ComprasModule() {
  const [vista, setVista] = useState<ComprasVista>("compras");
  const { permisos } = useSession();

  const vistaActions = [
    { key: "compras" },
    { key: "proveedores" }
  ].filter(action => permisos.includes(`compras.${action.key}`));

  useEffect(() => {
    if (vistaActions.length > 0 && !vistaActions.find(a => a.key === vista)) {
      setVista(vistaActions[0].key as ComprasVista);
    }
  }, [permisos, vista, vistaActions]);

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
