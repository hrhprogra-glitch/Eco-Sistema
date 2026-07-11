import type { DonutDatum } from "../types";
import styles from "./DonutChart.module.css";

const SIZE = 160;
const THICKNESS = 22;

export function DonutChart({ data }: { data: DonutDatum[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = (SIZE - THICKNESS) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = data.reduce<{ dash: number; offset: number }[]>((acc, d) => {
    const dash = (d.value / total) * circumference;
    const prev = acc[acc.length - 1];
    const offset = prev ? prev.offset + prev.dash : 0;
    return [...acc, { dash, offset }];
  }, []);

  return (
    <div className={styles.wrapper}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Gráfico de dona">
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          {data.map((d, i) => {
            const { dash, offset } = segments[i];
            return (
              <circle
                key={d.label}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth={THICKNESS}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
          })}
        </g>
      </svg>

      <ul className={styles.legend}>
        {data.map((d) => (
          <li key={d.label} className={styles.legendItem}>
            <span className={styles.swatch} style={{ background: d.color }} />
            <span className={styles.legendLabel}>{d.label}</span>
            <span className={styles.legendValue}>{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
