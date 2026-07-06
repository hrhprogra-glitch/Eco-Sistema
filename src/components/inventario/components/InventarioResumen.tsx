import { AlertTriangle, DollarSign, Package, PackageX } from "lucide-react";
import type { Producto } from "../types";
import styles from "./InventarioResumen.module.css";

export function InventarioResumen({
  products,
  onVerProductos,
}: {
  products: Producto[];
  onVerProductos: () => void;
}) {
  const totalProductos = products.length;
  const stockBajo = products.filter((p) => p.rastrear_inventario && p.stock > 0 && p.stock < 10).length;
  const sinStock = products.filter((p) => p.rastrear_inventario && p.stock <= 0).length;
  const valorInventario = products.reduce((sum, p) => sum + p.stock * p.costo, 0);

  const stats: { label: string; value: string | number; icon: typeof Package }[] = [
    { label: "Productos", value: totalProductos, icon: Package },
    { label: "Stock bajo (< 10)", value: stockBajo, icon: AlertTriangle },
    { label: "Sin stock", value: sinStock, icon: PackageX },
    {
      label: "Valor de inventario",
      value: `S/ ${valorInventario.toFixed(2)}`,
      icon: DollarSign,
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.statsGrid}>
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className={styles.statCard}>
            <span className={styles.statIcon}>
              <Icon size={20} />
            </span>
            <div>
              <p className={styles.statValue}>{value}</p>
              <p className={styles.statLabel}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className={styles.ctaButton} onClick={onVerProductos}>
        Ver productos
      </button>
    </div>
  );
}
