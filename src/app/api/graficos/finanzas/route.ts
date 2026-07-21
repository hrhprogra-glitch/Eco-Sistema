import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { monthBuckets, toDateParam, formatCurrency, formatCount, pctDelta, fillMonthlySeries } from "../helpers";

// Datos reales para la pestaña Finanzas de Gráficos: facturación (facturas + factura_pagos)
// y gastos operativos (tabla `gastos`, la misma que usa el módulo Gastos -- no la de
// asientos_contables/plan_cuentas, que es un concepto distinto de Contabilidad).
//
// El esquema no tiene un concepto real de "cuentas por pagar" (no hay pagos ni saldo
// registrados contra `entradas`, la factura de proveedor, ver sql/024_inventario_movimientos.sql):
// se reemplaza por "Gastos pendientes de pago", usando gastos.estado = 'pendiente', que sí
// existe en la tabla. "Cuentas por cobrar" y "Gastos pendientes de pago" son saldos vigentes
// (una foto de ahora mismo, no una serie histórica), así que no llevan flecha de tendencia --
// no hay una foto anterior real con la que compararlos honestamente.

const CATEGORIAS_MAX = 3;
const PALETA_CATEGORIAS = ["#2C5F9E", "#5580B4", "#7EA1CA"];
const COLOR_OTROS = "#A7C2E0";

function slugify(texto: string): string {
  const limpio = texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return limpio || "otros";
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const buckets = monthBuckets(6);
  const inicioVentana = toDateParam(buckets[0].date);

  const [ingresosRes, cobrarRes, gastosRes, pendientesRes, facturadoRes, gastosCategoriaRes] = await Promise.all([
    query<{ actual_30d: number; prev_30d: number }>(
      `SELECT
         COALESCE(SUM(monto) FILTER (WHERE fecha >= now() - interval '30 days'), 0)::float AS actual_30d,
         COALESCE(SUM(monto) FILTER (WHERE fecha >= now() - interval '60 days' AND fecha < now() - interval '30 days'), 0)::float AS prev_30d
       FROM factura_pagos`
    ),
    query<{ cantidad: number; saldo: number }>(
      `SELECT count(*)::int AS cantidad, COALESCE(SUM(f.total - COALESCE(p.pagado, 0)), 0)::float AS saldo
       FROM facturas f
       LEFT JOIN (SELECT factura_id, SUM(monto) AS pagado FROM factura_pagos GROUP BY factura_id) p ON p.factura_id = f.id
       WHERE f.estado IN ('enviada', 'vencida') AND (f.total - COALESCE(p.pagado, 0)) > 0`
    ),
    query<{ actual_30d: number; prev_30d: number }>(
      `SELECT
         COALESCE(SUM(monto) FILTER (WHERE fecha >= now() - interval '30 days'), 0)::float AS actual_30d,
         COALESCE(SUM(monto) FILTER (WHERE fecha >= now() - interval '60 days' AND fecha < now() - interval '30 days'), 0)::float AS prev_30d
       FROM gastos`
    ),
    query<{ cantidad: number; total: number }>(
      `SELECT count(*)::int AS cantidad, COALESCE(SUM(monto), 0)::float AS total
       FROM gastos WHERE estado = 'pendiente'`
    ),
    query<{ mes_key: string; total: number }>(
      `SELECT to_char(date_trunc('month', fecha), 'YYYY-MM') AS mes_key, COALESCE(SUM(total), 0)::float AS total
       FROM facturas
       WHERE estado <> 'borrador' AND fecha >= $1::date
       GROUP BY mes_key`,
      [inicioVentana]
    ),
    query<{ mes_key: string; categoria: string; total: number }>(
      `SELECT to_char(date_trunc('month', fecha), 'YYYY-MM') AS mes_key, categoria, COALESCE(SUM(monto), 0)::float AS total
       FROM gastos
       WHERE fecha >= $1::date
       GROUP BY mes_key, categoria`,
      [inicioVentana]
    ),
  ]);

  const ingresos = ingresosRes.rows[0] ?? { actual_30d: 0, prev_30d: 0 };
  const gastos = gastosRes.rows[0] ?? { actual_30d: 0, prev_30d: 0 };
  const cobrar = cobrarRes.rows[0] ?? { cantidad: 0, saldo: 0 };
  const pendientes = pendientesRes.rows[0] ?? { cantidad: 0, total: 0 };

  // --- Gastos por categoría: agrupa en las N categorías reales con más gasto en la
  // ventana de 6 meses y junta el resto en "Otros" (evita un donut/leyenda ilegible si el
  // catálogo de categorías de gastos crece).
  const categoriaTotales = new Map<string, number>();
  const porMes = new Map<string, Map<string, number>>();
  for (const row of gastosCategoriaRes.rows) {
    const total = Number(row.total);
    categoriaTotales.set(row.categoria, (categoriaTotales.get(row.categoria) ?? 0) + total);
    if (!porMes.has(row.mes_key)) porMes.set(row.mes_key, new Map());
    porMes.get(row.mes_key)!.set(row.categoria, total);
  }

  const categoriasOrdenadas = [...categoriaTotales.entries()].sort((a, b) => b[1] - a[1]);
  const topCategorias = categoriasOrdenadas.slice(0, CATEGORIAS_MAX).map(([cat]) => cat);
  const hayOtros = categoriasOrdenadas.length > CATEGORIAS_MAX;

  const gastosLegend = topCategorias.map((cat, i) => ({
    key: slugify(cat),
    label: cat,
    color: PALETA_CATEGORIAS[i % PALETA_CATEGORIAS.length],
  }));
  if (hayOtros) gastosLegend.push({ key: "otros", label: "Otros", color: COLOR_OTROS });

  const gastosPorCategoriaMensual = buckets.map((b) => {
    const mesMap = porMes.get(b.key) ?? new Map<string, number>();
    const segments = topCategorias.map((cat) => ({ key: slugify(cat), value: mesMap.get(cat) ?? 0 }));
    if (hayOtros) {
      const otros = [...mesMap.entries()].filter(([cat]) => !topCategorias.includes(cat)).reduce((s, [, v]) => s + v, 0);
      segments.push({ key: "otros", value: otros });
    }
    return { label: b.label, segments };
  });

  const gastosPorCategoria = [
    ...topCategorias.map((cat, i) => ({
      label: cat,
      value: Math.round(categoriaTotales.get(cat) ?? 0),
      color: PALETA_CATEGORIAS[i % PALETA_CATEGORIAS.length],
    })),
    ...(hayOtros
      ? [
          {
            label: "Otros",
            value: Math.round(categoriasOrdenadas.slice(CATEGORIAS_MAX).reduce((s, [, v]) => s + v, 0)),
            color: COLOR_OTROS,
          },
        ]
      : []),
  ];

  return NextResponse.json({
    kpis: {
      ingresos: { value: formatCurrency(ingresos.actual_30d), ...pctDelta(ingresos.actual_30d, ingresos.prev_30d) },
      cuentasPorCobrar: {
        value: formatCurrency(cobrar.saldo),
        deltaLabel:
          cobrar.cantidad > 0 ? `${formatCount(cobrar.cantidad)} factura(s) pendientes de cobro` : "Sin facturas pendientes",
      },
      gastos: { value: formatCurrency(gastos.actual_30d), ...pctDelta(gastos.actual_30d, gastos.prev_30d) },
      gastosPendientes: {
        value: formatCurrency(pendientes.total),
        deltaLabel:
          pendientes.cantidad > 0 ? `${formatCount(pendientes.cantidad)} gasto(s) pendientes de pago` : "Sin gastos pendientes",
      },
    },
    facturadoMensual: fillMonthlySeries(buckets, facturadoRes.rows),
    gastosPorCategoriaMensual,
    gastosLegend,
    gastosPorCategoria,
  });
}
