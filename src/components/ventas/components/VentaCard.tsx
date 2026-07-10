import type { Venta } from "../types";
import styles from "./VentaCard.module.css";

export function VentaCard({ venta, onClick }: { venta: Venta; onClick: () => void }) {
  const getStatusClass = () => {
    switch (venta.estado) {
      case "borrador":
        return styles.statusBorrador;
      case "confirmada":
        return styles.statusConfirmada;
      case "facturada":
        return styles.statusFacturada;
      case "cancelada":
        return styles.statusCancelada;
      default:
        return styles.statusBorrador;
    }
  };

  return (
    <div
      className={styles.card}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.header}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className={styles.title}>{venta.contacto_nombre || "Sin cliente"}</p>
          <span className={styles.date}>S00{venta.numero}</span>
        </div>
        <span className={`${styles.status} ${getStatusClass()}`}>
          {venta.estado}
        </span>
      </div>

      <div className={styles.details}>
        <span className={styles.date}>
          {new Date(`${venta.fecha}T00:00:00`).toLocaleDateString("es-PE")}
        </span>
        <p className={styles.amount}>S/ {Number(venta.total).toFixed(2)}</p>
      </div>
    </div>
  );
}
