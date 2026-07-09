import { Clock, DollarSign, Receipt, CheckCircle2, Tags } from "lucide-react";
import type { Gasto } from "../types";
import styles from "./GastosResumen.module.css";

function esMismoMes(fecha: string) {
  const d = new Date(`${fecha}T00:00:00`);
  const hoy = new Date();
  return d.getFullYear() === hoy.getFullYear() && d.getMonth() === hoy.getMonth();
}

export function GastosResumen({
  gastos,
  onVerGastos,
}: {
  gastos: Gasto[];
  onVerGastos: () => void;
}) {
  const gastosDelMes = gastos.filter((g) => esMismoMes(g.fecha));
  const totalDelMes = gastosDelMes.reduce((sum, g) => sum + g.monto, 0);

  const pendientes = gastos.filter((g) => g.estado === "pendiente");
  const totalPendiente = pendientes.reduce((sum, g) => sum + g.monto, 0);

  const pagados = gastos.filter((g) => g.estado === "pagado");
  const totalPagado = pagados.reduce((sum, g) => sum + g.monto, 0);

  const categoriasTotales = gastos.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + g.monto;
    return acc;
  }, {} as Record<string, number>);
  const totalGeneral = gastos.reduce((sum, g) => sum + g.monto, 0);

  const stats: { label: string; value: string | number; icon: typeof Receipt; colorClass?: string }[] = [
    { label: "Gastado este mes", value: `S/ ${totalDelMes.toFixed(2)}`, icon: DollarSign },
    { label: "Pendiente de pago", value: `S/ ${totalPendiente.toFixed(2)}`, icon: Clock, colorClass: styles.warningIcon },
    { label: "Pagado", value: `S/ ${totalPagado.toFixed(2)}`, icon: CheckCircle2, colorClass: styles.successIcon },
    { label: "Total de gastos registrados", value: gastos.length, icon: Receipt },
  ];

  const pendientesOrdenados = [...pendientes]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 6);

  return (
    <div className={styles.wrapper}>
      <div className={styles.statsGrid}>
        {stats.map(({ label, value, icon: Icon, colorClass }) => (
          <div key={label} className={styles.statCard}>
            <span className={`${styles.statIcon} ${colorClass || ""}`}>
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
            <Clock size={18} className={styles.sectionIconWarning} />
            <h3>Pendientes de pago</h3>
          </div>
          {pendientesOrdenados.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.simpleTable}>
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Categoría</th>
                    <th>Fecha</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {pendientesOrdenados.map((g) => (
                    <tr key={g.id}>
                      <td className={styles.conceptoCell}>{g.concepto}</td>
                      <td className={styles.textMuted}>{g.categoria}</td>
                      <td className={styles.textMuted}>
                        {new Date(`${g.fecha}T00:00:00`).toLocaleDateString("es-PE")}
                      </td>
                      <td className={styles.montoCell}>S/ {g.monto.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pendientes.length > 6 && (
                <p className={styles.moreText}>+ {pendientes.length - 6} gastos pendientes más</p>
              )}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No hay gastos pendientes de pago.</p>
            </div>
          )}
        </div>

        <div className={styles.dashboardSection}>
          <div className={styles.sectionHeader}>
            <Tags size={18} className={styles.sectionIconInfo} />
            <h3>Gasto por categoría</h3>
          </div>
          {Object.keys(categoriasTotales).length > 0 ? (
            <div className={styles.categoriesList}>
              {Object.entries(categoriasTotales)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, monto]) => (
                  <div key={cat} className={styles.categoryItem}>
                    <span className={styles.categoryName}>{cat}</span>
                    <span className={styles.categoryCount}>S/ {monto.toFixed(2)}</span>
                    <div className={styles.categoryBarBg}>
                      <div
                        className={styles.categoryBarFill}
                        style={{ width: `${Math.max(5, (monto / totalGeneral) * 100)}%` }}
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
        <button type="button" className={styles.ctaButton} onClick={onVerGastos}>
          Gestionar gastos
        </button>
      </div>
    </div>
  );
}
