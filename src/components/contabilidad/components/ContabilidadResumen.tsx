import { Landmark, TrendingUp, TrendingDown, AlertTriangle, Scale } from "lucide-react";
import type { AsientoContable, CuentaContable } from "../types";
import { esNaturalezaDeudora } from "../naturaleza";
import styles from "./ContabilidadResumen.module.css";

export function ContabilidadResumen({
  cuentas,
  asientos,
  onVerAsiento,
  onVerDiario,
}: {
  cuentas: CuentaContable[];
  asientos: AsientoContable[];
  onVerAsiento: (asiento: AsientoContable) => void;
  onVerDiario: () => void;
}) {
  const saldoPorTipo = (tipo: CuentaContable["tipo"]) => {
    const ids = new Set(cuentas.filter((c) => c.tipo === tipo).map((c) => c.id));
    let total = 0;
    for (const asiento of asientos) {
      if (asiento.estado !== "confirmado") continue;
      for (const linea of asiento.lineas) {
        if (!ids.has(linea.cuenta_id)) continue;
        total += esNaturalezaDeudora(tipo) ? Number(linea.debe) - Number(linea.haber) : Number(linea.haber) - Number(linea.debe);
      }
    }
    return total;
  };

  const activos = saldoPorTipo("activo");
  const pasivos = saldoPorTipo("pasivo");
  const patrimonio = saldoPorTipo("patrimonio");
  const ingresos = saldoPorTipo("ingreso");
  const gastos = saldoPorTipo("gasto");
  const resultado = ingresos - gastos;

  const borradores = asientos.filter((a) => a.estado === "borrador");

  const stats: { label: string; value: string; icon: typeof Landmark; colorClass?: string }[] = [
    { label: "Activos", value: `S/ ${activos.toFixed(2)}`, icon: Landmark },
    { label: "Pasivos", value: `S/ ${pasivos.toFixed(2)}`, icon: Scale },
    { label: "Patrimonio", value: `S/ ${patrimonio.toFixed(2)}`, icon: Landmark },
    {
      label: "Resultado (Ingresos - Gastos)",
      value: `S/ ${resultado.toFixed(2)}`,
      icon: resultado >= 0 ? TrendingUp : TrendingDown,
      colorClass: resultado >= 0 ? styles.successIcon : styles.dangerIcon,
    },
    {
      label: "Asientos en borrador",
      value: String(borradores.length),
      icon: AlertTriangle,
      colorClass: borradores.length > 0 ? styles.warningIcon : undefined,
    },
  ];

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

      <div className={styles.dashboardSection}>
        <div className={styles.sectionHeader}>
          <h3>Asientos pendientes de confirmar</h3>
          <button type="button" className={styles.linkBtn} onClick={onVerDiario}>
            Ver libro diario
          </button>
        </div>
        {borradores.length > 0 ? (
          <table className={styles.simpleTable}>
            <thead>
              <tr>
                <th>N°</th>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {borradores.slice(0, 8).map((a) => (
                <tr key={a.id} onClick={() => onVerAsiento(a)}>
                  <td>ASI-{String(a.id).padStart(5, "0")}</td>
                  <td>{new Date(a.fecha).toLocaleDateString("es-PE")}</td>
                  <td>{a.descripcion}</td>
                  <td>
                    <span className={styles.badgeWarning}>Borrador</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <p>No hay asientos pendientes. Todo el registro está al día.</p>
          </div>
        )}
      </div>
    </div>
  );
}
