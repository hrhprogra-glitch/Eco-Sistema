// Utilidades compartidas por las rutas /api/graficos/* para armar series mensuales
// y KPIs con delta "vs periodo anterior" a partir de datos reales de la base.
// No es una ruta (no exporta GET/POST), así que Next no la trata como endpoint.

const MESES_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export type MonthBucket = { key: string; label: string; date: Date };

/**
 * Genera `n` casilleros mensuales consecutivos, terminando `offsetMonths` meses antes
 * del mes en curso (offsetMonths = 0 => el último casillero es el mes actual).
 * `key` ("YYYY-MM") se usa para calzar filas reales agrupadas por mes; `label` es el
 * nombre corto en español para el eje X del gráfico.
 */
export function monthBuckets(n: number, offsetMonths = 0): MonthBucket[] {
  const now = new Date();
  const buckets: MonthBucket[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i - offsetMonths, 1);
    buckets.push({ key: monthKey(date), label: MESES_ES[date.getMonth()], date });
  }
  return buckets;
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Fecha del primer día del mes en formato YYYY-MM-DD, para usar como parámetro en WHERE fecha >= $1::date. */
export function toDateParam(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

/**
 * Variación porcentual de `current` contra `previous`, con la forma que espera KpiTile
 * (deltaLabel + trend). Devuelve undefined cuando no hay base de comparación (ambos en 0),
 * para que el KpiTile simplemente no muestre línea de delta.
 */
export function pctDelta(current: number, previous: number): { deltaLabel: string; trend: "up" | "down" } | undefined {
  if (previous === 0) {
    if (current === 0) return undefined;
    return { deltaLabel: "Nuevo vs periodo anterior", trend: "up" };
  }
  const pct = ((current - previous) / previous) * 100;
  if (Math.abs(pct) < 0.05) {
    return { deltaLabel: "Sin cambios vs periodo anterior", trend: "up" };
  }
  return {
    deltaLabel: `${Math.abs(pct).toFixed(1)}% vs periodo anterior`,
    trend: pct >= 0 ? "up" : "down",
  };
}

/** Rellena `buckets` con los totales reales de `rows` (agrupados por mes_key), 0 donde no hubo movimiento. */
export function fillMonthlySeries(
  buckets: MonthBucket[],
  rows: { mes_key: string; total: number | string }[]
): { label: string; value: number }[] {
  const byKey = new Map(rows.map((r) => [r.mes_key, Number(r.total)]));
  return buckets.map((b) => ({ label: b.label, value: byKey.get(b.key) ?? 0 }));
}
