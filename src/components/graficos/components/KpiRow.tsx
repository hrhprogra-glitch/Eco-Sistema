import type { KpiDatum } from "../types";
import { KpiTile } from "./KpiTile";
import styles from "./KpiRow.module.css";

export function KpiRow({ items }: { items: KpiDatum[] }) {
  return (
    <div className={styles.row}>
      {items.map((item) => (
        <KpiTile key={item.label} {...item} />
      ))}
    </div>
  );
}
