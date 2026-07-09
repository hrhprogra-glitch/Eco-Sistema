import { AlertTriangle, DollarSign, Package, PackageX, TrendingUp, Tags } from "lucide-react";
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
  
  // Utilizar limite_stock definido o 10 por defecto
  const stockBajoList = products.filter(
    (p) => p.rastrear_inventario && p.stock > 0 && p.stock <= (p.limite_stock || 10)
  );
  const sinStockList = products.filter((p) => p.rastrear_inventario && p.stock <= 0);
  
  const valorInventario = products.reduce((sum, p) => sum + p.stock * p.costo, 0);
  const valorVentaEsperado = products.reduce((sum, p) => sum + p.stock * p.precio, 0);

  // Agrupar por categoría
  const categoriasCount = products.reduce((acc, p) => {
    const cat = p.categoria || "Sin categoría";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats: { label: string; value: string | number; icon: typeof Package; colorClass?: string }[] = [
    { label: "Total Productos", value: totalProductos, icon: Package },
    { label: "Stock bajo", value: stockBajoList.length, icon: AlertTriangle, colorClass: styles.warningIcon },
    { label: "Sin stock", value: sinStockList.length, icon: PackageX, colorClass: styles.dangerIcon },
    {
      label: "Valor de costo (Inventario)",
      value: `S/ ${valorInventario.toFixed(2)}`,
      icon: DollarSign,
    },
    {
      label: "Valor de venta potencial",
      value: `S/ ${valorVentaEsperado.toFixed(2)}`,
      icon: TrendingUp,
      colorClass: styles.successIcon
    },
  ];

  // Elementos que necesitan atención rápida (primeros 5)
  const atencionRequerida = [...sinStockList, ...stockBajoList].slice(0, 6);

  return (
    <div className={styles.wrapper}>
      <div className={styles.statsGrid}>
        {stats.map(({ label, value, icon: Icon, colorClass }) => (
          <div key={label} className={styles.statCard}>
            <span className={`${styles.statIcon} ${colorClass || ''}`}>
              <Icon size={22} />
            </span>
            <div>
              <p className={styles.statValue}>{value}</p>
              <p className={styles.statLabel}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.dashboardSection}>
          <div className={styles.sectionHeader}>
            <AlertTriangle size={18} className={styles.sectionIconWarning} />
            <h3>Atención Requerida (Stock bajo/nulo)</h3>
          </div>
          {atencionRequerida.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.simpleTable}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>SKU</th>
                    <th>Stock</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {atencionRequerida.map(p => (
                    <tr key={p.id}>
                      <td className={styles.productName}>{p.nombre}</td>
                      <td className={styles.textMuted}>{p.sku || '-'}</td>
                      <td className={styles.stockCell}>
                        <span className={p.stock <= 0 ? styles.badgeDanger : styles.badgeWarning}>
                          {p.stock} {p.unidad}
                        </span>
                      </td>
                      <td className={styles.textMuted}>
                        {p.stock <= 0 ? 'Agotado' : 'Por agotarse'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(sinStockList.length + stockBajoList.length) > 6 && (
                <p className={styles.moreText}>
                  + {(sinStockList.length + stockBajoList.length) - 6} productos más requieren atención
                </p>
              )}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>Todo en orden. Ningún producto tiene stock bajo.</p>
            </div>
          )}
        </div>

        <div className={styles.dashboardSection}>
          <div className={styles.sectionHeader}>
            <Tags size={18} className={styles.sectionIconInfo} />
            <h3>Distribución por Categorías</h3>
          </div>
          {Object.keys(categoriasCount).length > 0 ? (
            <div className={styles.categoriesList}>
              {Object.entries(categoriasCount)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <div key={cat} className={styles.categoryItem}>
                    <span className={styles.categoryName}>{cat}</span>
                    <span className={styles.categoryCount}>{count} prod.</span>
                    <div className={styles.categoryBarBg}>
                      <div 
                        className={styles.categoryBarFill} 
                        style={{ width: `${Math.max(5, (count / totalProductos) * 100)}%` }} 
                      />
                    </div>
                  </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No hay categorías registradas.</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.actionsBar}>
        <button type="button" className={styles.ctaButton} onClick={onVerProductos}>
          Gestionar inventario completo
        </button>
      </div>
    </div>
  );
}
