import type { StackedSeriesDatum, StackedSeriesLegend } from "../types";
import styles from "./StackedBarChart.module.css";

const CHART_HEIGHT = 200;
const BAR_WIDTH = 40;
const COLUMN_WIDTH = 72;
const AXIS_PADDING = 24;

export function StackedBarChart({ data, legend }: { data: StackedSeriesDatum[]; legend: StackedSeriesLegend[] }) {
  const totals = data.map((d) => d.segments.reduce((sum, s) => sum + s.value, 0));
  const max = Math.max(...totals, 1);
  const width = data.length * COLUMN_WIDTH;
  const colorByKey = Object.fromEntries(legend.map((l) => [l.key, l.color]));

  return (
    <div className={styles.wrapper}>
      <div className={styles.legend}>
        {legend.map((l) => (
          <span key={l.key} className={styles.legendItem}>
            <span className={styles.swatch} style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${width} ${CHART_HEIGHT}`} className={styles.svg} preserveAspectRatio="none" role="img" aria-label="Gráfico de barras apiladas">
        {data.map((d, i) => {
          const x = i * COLUMN_WIDTH + (COLUMN_WIDTH - BAR_WIDTH) / 2;
          let yCursor = CHART_HEIGHT - AXIS_PADDING;
          return (
            <g key={d.label}>
              {d.segments.map((seg) => {
                const segHeight = (seg.value / max) * (CHART_HEIGHT - AXIS_PADDING - 4);
                yCursor -= segHeight;
                return <rect key={seg.key} x={x} y={yCursor} width={BAR_WIDTH} height={segHeight} fill={colorByKey[seg.key]} />;
              })}
            </g>
          );
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
