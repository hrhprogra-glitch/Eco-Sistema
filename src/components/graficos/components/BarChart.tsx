import type { ChartDatum } from "../types";
import styles from "./BarChart.module.css";

const CHART_HEIGHT = 180;
const BAR_WIDTH = 36;
const COLUMN_WIDTH = 64;
const AXIS_PADDING = 24;

export function BarChart({ data, color }: { data: ChartDatum[]; color: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const width = data.length * COLUMN_WIDTH;

  return (
    <div className={styles.wrapper}>
      <svg
        viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
        className={styles.svg}
        preserveAspectRatio="none"
        role="img"
        aria-label="Gráfico de barras"
      >
        {data.map((d, i) => {
          const barHeight = (d.value / max) * (CHART_HEIGHT - AXIS_PADDING - 4);
          const x = i * COLUMN_WIDTH + (COLUMN_WIDTH - BAR_WIDTH) / 2;
          const y = CHART_HEIGHT - AXIS_PADDING - barHeight;
          return <rect key={d.label} x={x} y={y} width={BAR_WIDTH} height={barHeight} rx={2} fill={color} />;
        })}
        <line x1={0} y1={CHART_HEIGHT - AXIS_PADDING} x2={width} y2={CHART_HEIGHT - AXIS_PADDING} className={styles.axis} />
      </svg>
      <div className={styles.xAxis}>
        {data.map((d) => (
          <span key={d.label} className={styles.label}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
