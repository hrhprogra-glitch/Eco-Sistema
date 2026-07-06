import { AlertTriangle, Waves } from "lucide-react";
import styles from "./PiscinaNav.module.css";

type Vista = "piscinas" | "alertas";

export function PiscinaNav({
  vista,
  alertasCount,
  onChange,
}: {
  vista: Vista;
  alertasCount: number;
  onChange: (vista: Vista) => void;
}) {
  return (
    <div className={styles.nav}>
      <button
        type="button"
        className={`${styles.item} ${vista === "piscinas" ? styles.active : ""}`}
        onClick={() => onChange("piscinas")}
      >
        <Waves size={14} />
        Piscinas
      </button>
      <button
        type="button"
        className={`${styles.item} ${vista === "alertas" ? styles.active : ""}`}
        onClick={() => onChange("alertas")}
      >
        <AlertTriangle size={14} />
        Alertas
        {alertasCount > 0 && <span className={styles.badge}>{alertasCount}</span>}
      </button>
    </div>
  );
}
