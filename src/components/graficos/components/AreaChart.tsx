import type { ChartDatum } from "../types";
import styles from "./AreaChart.module.css";

const CHART_HEIGHT = 200;
const AXIS_PADDING = 24;
const Y_LABEL_STEPS = 4;

function buildPoints(data: ChartDatum[], max: number, width: number, columnWidth: number) {
  return data.map((d, i) => {
    const x = i * columnWidth + columnWidth / 2;
    const y = CHART_HEIGHT - AXIS_PADDING - (d.value / max) * (CHART_HEIGHT - AXIS_PADDING - 10);
    return { x, y, ...d };
  });
}

export function AreaChart({
  data,
  compareData,
  color = "var(--eco-celeste)",
  formatValue = (v: number) => String(v),
}: {
  data: ChartDatum[];
  compareData?: ChartDatum[];
  color?: string;
  formatValue?: (value: number) => string;
}) {
  const columnWidth = 90;
  const width = Math.max(data.length - 1, 1) * columnWidth + columnWidth;
  const max = Math.max(...data.map((d) => d.value), ...(compareData?.map((d) => d.value) ?? []), 1);

  const points = buildPoints(data, max, width, columnWidth);
  const comparePoints = compareData ? buildPoints(compareData, max, width, columnWidth) : null;

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${CHART_HEIGHT - AXIS_PADDING} L${points[0].x},${CHART_HEIGHT - AXIS_PADDING} Z`;

  const compareLinePath = comparePoints
    ? comparePoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")
    : null;
  const compareAreaPath = comparePoints
    ? `${compareLinePath} L${comparePoints[comparePoints.length - 1].x},${CHART_HEIGHT - AXIS_PADDING} L${comparePoints[0].x},${CHART_HEIGHT - AXIS_PADDING} Z`
    : null;

  const yLabels = Array.from({ length: Y_LABEL_STEPS + 1 }, (_, i) => {
    const value = (max / Y_LABEL_STEPS) * (Y_LABEL_STEPS - i);
    const y = AXIS_PADDING - 14 + (i * (CHART_HEIGHT - AXIS_PADDING - 10)) / Y_LABEL_STEPS;
    return { value, y };
  });

  const gradientId = `area-gradient-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className={styles.wrapper}>
      <div className={styles.yAxis}>
        {yLabels.map((l) => (
          <span key={l.y} className={styles.yLabel}>
            {formatValue(l.value)}
          </span>
        ))}
      </div>
      <div className={styles.chartArea}>
        <svg viewBox={`0 0 ${width} ${CHART_HEIGHT}`} className={styles.svg} preserveAspectRatio="none" role="img" aria-label="Gráfico de área">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {yLabels.map((l) => (
            <line key={l.y} x1={0} y1={l.y} x2={width} y2={l.y} className={styles.gridLine} />
          ))}

          {compareAreaPath && compareLinePath && (
            <>
              <path d={compareAreaPath} fill="var(--text-secondary)" opacity={0.08} />
              <path d={compareLinePath} fill="none" stroke="var(--text-secondary)" strokeWidth={2} strokeDasharray="4 4" opacity={0.5} />
            </>
          )}

          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} />
          {points.map((p) => (
            <circle key={p.label} cx={p.x} cy={p.y} r={3.5} fill={color} />
          ))}

          <line x1={0} y1={CHART_HEIGHT - AXIS_PADDING} x2={width} y2={CHART_HEIGHT - AXIS_PADDING} className={styles.axis} />
        </svg>
        <div className={styles.xAxis}>
          {data.map((d) => (
            <span key={d.label} className={styles.xLabel}>
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
