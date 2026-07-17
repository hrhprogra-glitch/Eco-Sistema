import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "./KpiTile.module.css";

export type KpiDatum = {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  deltaLabel?: string;
  trend?: "up" | "down";
};

export function KpiTile({ label, value, icon: Icon, color, deltaLabel, trend }: KpiDatum) {
  return (
    <div className={styles.tile}>
      <div className={styles.iconBadge} style={{ background: `${color}1f`, color, boxShadow: `0 0 10px -2px ${color}99` }}>
        <Icon size={18} />
      </div>
      <div className={styles.body}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
        {deltaLabel && (
          <span className={styles.delta} data-trend={trend}>
            {trend === "up" && <ArrowUpRight size={13} />}
            {trend === "down" && <ArrowDownRight size={13} />}
            {deltaLabel}
          </span>
        )}
      </div>
    </div>
  );
}
