import type { AsientoContable } from "../types";
import styles from "./AsientoDetail.module.css";

export function AsientoDetail({
  asiento,
  onBack,
  onConfirm,
  onDelete,
}: {
  asiento: AsientoContable;
  onBack: () => void;
  onConfirm: () => void;
  onDelete: () => void;
}) {
  const totalDebe = asiento.lineas.reduce((sum, l) => sum + Number(l.debe), 0);
  const totalHaber = asiento.lineas.reduce((sum, l) => sum + Number(l.haber), 0);
  const esBorrador = asiento.estado === "borrador";

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button type="button" onClick={onBack} className={styles.back}>
          Libro Diario
        </button>
        <span className={styles.crumbSeparator}>/</span>
        <span className={styles.crumbCurrent}>ASI-{String(asiento.id).padStart(5, "0")}</span>
      </div>

      <div className={styles.header}>
        <div>
          <div className={styles.title}>{asiento.descripcion}</div>
          <div className={styles.meta}>
            {new Date(asiento.fecha).toLocaleDateString("es-PE")} ·{" "}
            <span className={`${styles.badge} ${esBorrador ? styles.estadoBorrador : styles.estadoConfirmado}`}>
              {esBorrador ? "Borrador" : "Confirmado"}
            </span>
          </div>
        </div>
        {esBorrador && (
          <div className={styles.actions}>
            <button type="button" className={styles.deleteBtn} onClick={onDelete}>
              Eliminar
            </button>
            <button type="button" className={styles.confirmBtn} onClick={onConfirm}>
              Confirmar asiento
            </button>
          </div>
        )}
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Cuenta</th>
            <th>Detalle</th>
            <th className={styles.amount}>Debe</th>
            <th className={styles.amount}>Haber</th>
          </tr>
        </thead>
        <tbody>
          {asiento.lineas.map((l) => (
            <tr key={l.id}>
              <td>
                {l.cuenta_codigo} · {l.cuenta_nombre}
              </td>
              <td>{l.descripcion || "—"}</td>
              <td className={styles.amount}>{Number(l.debe) > 0 ? `S/ ${Number(l.debe).toFixed(2)}` : "—"}</td>
              <td className={styles.amount}>{Number(l.haber) > 0 ? `S/ ${Number(l.haber).toFixed(2)}` : "—"}</td>
            </tr>
          ))}
          <tr className={styles.totalsRow}>
            <td colSpan={2}>Total</td>
            <td className={styles.amount}>S/ {totalDebe.toFixed(2)}</td>
            <td className={styles.amount}>S/ {totalHaber.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
