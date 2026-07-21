import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { monthBuckets, toDateParam, formatCurrency, formatCount, pctDelta, fillMonthlySeries } from "../helpers";

// Datos reales para la pestaña Comercial de Gráficos: cotizaciones, oportunidades y
// contactos. No existe tabla de "vendedor" en el esquema (cotizaciones no tiene
// atribución de vendedor), así que el ranking usa mejores clientes en vez de mejores
// vendedores. Tampoco hay ruta /api/pedidos activa (la tabla `pedidos` de
// 013_crm_cotizaciones_pedidos.sql quedó sin usar: el flujo de venta real es
// cotizaciones.estado = 'confirmada', ver 017_fusionar_ventas_en_cotizaciones.sql), así
// que "Ventas confirmadas" reemplaza al KPI "Pedidos" del mock.

const ETAPA_LABEL: Record<string, string> = {
  nuevo: "Nuevo",
  calificado: "Calificado",
  propuesta: "Propuesta",
  ganado: "Ganado",
  perdido: "Perdido",
};

const ETAPA_COLOR: Record<string, string> = {
  nuevo: "#714B67",
  calificado: "#95688F",
  propuesta: "#B98CB3",
  ganado: "#2E7D32",
  perdido: "#C2185B",
};

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const buckets = monthBuckets(6);
  const inicioVentana = toDateParam(buckets[0].date);

  const [cotizacionesAggRes, oportunidadesAggRes, ventasPorMesRes, mejoresClientesRes, etapaRes] = await Promise.all([
    query<{
      total_cotizaciones: number;
      cotizaciones_30d: number;
      cotizaciones_prev30d: number;
      confirmadas_total: number;
      confirmadas_30d: number;
      confirmadas_prev30d: number;
      ingresos_30d: number;
      ingresos_prev30d: number;
    }>(
      `SELECT
         count(*)::int AS total_cotizaciones,
         count(*) FILTER (WHERE created_at >= now() - interval '30 days')::int AS cotizaciones_30d,
         count(*) FILTER (WHERE created_at >= now() - interval '60 days' AND created_at < now() - interval '30 days')::int AS cotizaciones_prev30d,
         count(*) FILTER (WHERE estado = 'confirmada')::int AS confirmadas_total,
         count(*) FILTER (WHERE estado = 'confirmada' AND created_at >= now() - interval '30 days')::int AS confirmadas_30d,
         count(*) FILTER (WHERE estado = 'confirmada' AND created_at >= now() - interval '60 days' AND created_at < now() - interval '30 days')::int AS confirmadas_prev30d,
         COALESCE(SUM(total) FILTER (WHERE estado = 'confirmada' AND fecha >= now() - interval '30 days'), 0)::float AS ingresos_30d,
         COALESCE(SUM(total) FILTER (WHERE estado = 'confirmada' AND fecha >= now() - interval '60 days' AND fecha < now() - interval '30 days'), 0)::float AS ingresos_prev30d
       FROM cotizaciones`
    ),
    query<{ abiertas: number; creadas_30d: number; creadas_prev30d: number }>(
      `SELECT
         count(*) FILTER (WHERE etapa NOT IN ('ganado', 'perdido'))::int AS abiertas,
         count(*) FILTER (WHERE created_at >= now() - interval '30 days')::int AS creadas_30d,
         count(*) FILTER (WHERE created_at >= now() - interval '60 days' AND created_at < now() - interval '30 days')::int AS creadas_prev30d
       FROM oportunidades`
    ),
    query<{ mes_key: string; total: number }>(
      `SELECT to_char(date_trunc('month', fecha), 'YYYY-MM') AS mes_key, COALESCE(SUM(total), 0)::float AS total
       FROM cotizaciones
       WHERE estado = 'confirmada' AND fecha >= $1::date
       GROUP BY mes_key`,
      [inicioVentana]
    ),
    query<{ nombre: string; total: number }>(
      `SELECT c.nombre AS nombre, SUM(q.total)::float AS total
       FROM cotizaciones q
       JOIN contactos c ON c.id = q.contacto_id
       GROUP BY c.id, c.nombre
       ORDER BY total DESC
       LIMIT 5`
    ),
    query<{ etapa: string; total: number }>(
      `SELECT etapa, count(*)::int AS total
       FROM oportunidades
       GROUP BY etapa`
    ),
  ]);

  const cot = cotizacionesAggRes.rows[0];
  const opp = oportunidadesAggRes.rows[0];

  return NextResponse.json({
    kpis: {
      cotizaciones: { value: formatCount(cot.total_cotizaciones), ...pctDelta(cot.cotizaciones_30d, cot.cotizaciones_prev30d) },
      confirmadas: { value: formatCount(cot.confirmadas_total), ...pctDelta(cot.confirmadas_30d, cot.confirmadas_prev30d) },
      ingresos30d: { value: formatCurrency(cot.ingresos_30d), ...pctDelta(cot.ingresos_30d, cot.ingresos_prev30d) },
      oportunidadesAbiertas: { value: formatCount(opp.abiertas), ...pctDelta(opp.creadas_30d, opp.creadas_prev30d) },
    },
    ventasPorMes: fillMonthlySeries(buckets, ventasPorMesRes.rows),
    mejoresClientes: mejoresClientesRes.rows.map((r) => ({
      label: r.nombre,
      value: Number(r.total),
      valueLabel: formatCurrency(Number(r.total)),
    })),
    oportunidadesPorEtapa: etapaRes.rows.map((r) => ({
      label: ETAPA_LABEL[r.etapa] ?? r.etapa,
      value: Number(r.total),
      color: ETAPA_COLOR[r.etapa] ?? "#95688F",
    })),
  });
}
