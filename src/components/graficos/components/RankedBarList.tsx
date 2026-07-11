import type { RankedDatum } from "../types";
import styles from "./RankedBarList.module.css";

export function RankedBarList({ data, color = "var(--eco-celeste)" }: { data: RankedDatum[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <ul className={styles.list}>
      {data.map((d) => (
        <li key={d.label} className={styles.row}>
          <span className={styles.label} title={d.label}>
            {d.label}
          </span>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${(d.value / max) * 100}%`, background: color }} />
          </div>
          <span className={styles.value}>{d.valueLabel}</span>
        </li>
      ))}
    </ul>
  );
}
