import { Tag } from "lucide-react";
import type { Gasto } from "../types";
import styles from "./GastoCard.module.css";

export function GastoCard({
  gasto,
  onClick,
}: {
  gasto: Gasto;
  onClick: () => void;
}) {
  return (
    <article
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.top}>
        <span className={`${styles.estadoBadge} ${gasto.estado === "pagado" ? styles.estadoPagado : styles.estadoPendiente}`}>
          {gasto.estado === "pagado" ? "Pagado" : "Pendiente"}
        </span>
        <span className={styles.monto}>S/ {gasto.monto.toFixed(2)}</span>
      </div>
      <p className={styles.concepto}>{gasto.concepto}</p>
      <div className={styles.meta}>
        <span className={styles.categoriaBadge}>
          <Tag size={11} />
          {gasto.categoria}
        </span>
        <span className={styles.fecha}>
          {new Date(`${gasto.fecha}T00:00:00`).toLocaleDateString("es-PE")}
        </span>
      </div>
    </article>
  );
}
