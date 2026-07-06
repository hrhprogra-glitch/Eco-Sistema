import { LayoutDashboard, Package } from "lucide-react";
import styles from "./InventarioNav.module.css";

type Vista = "resumen" | "productos";

export function InventarioNav({
  vista,
  onChange,
}: {
  vista: Vista;
  onChange: (vista: Vista) => void;
}) {
  return (
    <nav className={styles.nav}>
      <button
        type="button"
        className={`${styles.item} ${vista === "resumen" ? styles.active : ""}`}
        onClick={() => onChange("resumen")}
      >
        <LayoutDashboard size={15} />
        Resumen
      </button>
      <button
        type="button"
        className={`${styles.item} ${vista === "productos" ? styles.active : ""}`}
        onClick={() => onChange("productos")}
      >
        <Package size={15} />
        Productos
      </button>
    </nav>
  );
}
