import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { monthBuckets, toDateParam, formatCurrency, formatCount, pctDelta, fillMonthlySeries } from "../helpers";

// Resumen cruzado (Comercial + Finanzas) para la pestaña Analítica: ingresos reales
// vienen de cotizaciones.estado = 'confirmada' (la venta real en este esquema, ver
// 017_fusionar_ventas_en_cotizaciones.sql); gastos vienen de la tabla `gastos`. No hay
// columna de categoría/área en productos, así que "distribución de ingresos" se adapta a
// una dimensión real que sí existe en contactos: empresa vs particular (es_empresa).

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const buckets = monthBuckets(6);
  const prevBuckets = monthBuckets(6, 6);
  const inicioActual = toDateParam(buckets[0].date);
  const inicioPrevio = toDateParam(prevBuckets[0].date);

  const [ingresosActualRes, ingresosPrevioRes, gastosAggRes, oportunidadesAggRes, distribucionRes, mejoresClientesRes, clientesRes, cobrarRes, invValRes, prodVendidosRes, provPrincipalesRes, comprasRes] = await Promise.all([
    query<{ mes_key: string; total: number }>(
      `SELECT to_char(date_trunc('month', fecha), 'YYYY-MM') AS mes_key, COALESCE(SUM(total), 0)::float AS total
       FROM cotizaciones
       WHERE estado = 'confirmada' AND fecha >= $1::date
       GROUP BY mes_key`,
      [inicioActual]
    ),
    query<{ mes_key: string; total: number }>(
      `SELECT to_char(date_trunc('month', fecha), 'YYYY-MM') AS mes_key, COALESCE(SUM(total), 0)::float AS total
       FROM cotizaciones
       WHERE estado = 'confirmada' AND fecha >= $1::date AND fecha < $2::date
       GROUP BY mes_key`,
      [inicioPrevio, inicioActual]
    ),
    query<{ gastos_actual: number; gastos_previo: number }>(
      `SELECT
         COALESCE(SUM(monto) FILTER (WHERE fecha >= $1::date), 0)::float AS gastos_actual,
         COALESCE(SUM(monto) FILTER (WHERE fecha >= $2::date AND fecha < $1::date), 0)::float AS gastos_previo
       FROM gastos`,
      [inicioActual, inicioPrevio]
    ),
    query<{ abiertas: number; creadas_30d: number; creadas_prev30d: number }>(
      `SELECT
         count(*) FILTER (WHERE etapa NOT IN ('ganado', 'perdido'))::int AS abiertas,
         count(*) FILTER (WHERE created_at >= now() - interval '30 days')::int AS creadas_30d,
         count(*) FILTER (WHERE created_at >= now() - interval '60 days' AND created_at < now() - interval '30 days')::int AS creadas_prev30d
       FROM oportunidades`
    ),
    query<{ es_empresa: boolean; total: number }>(
      `SELECT c.es_empresa AS es_empresa, COALESCE(SUM(q.total), 0)::float AS total
       FROM cotizaciones q
       JOIN contactos c ON c.id = q.contacto_id
       WHERE q.estado = 'confirmada' AND q.fecha >= $1::date
       GROUP BY c.es_empresa`,
      [inicioActual]
    ),
    query<{ nombre: string; total: number }>(
      `SELECT c.nombre AS nombre, SUM(q.total)::float AS total
       FROM cotizaciones q
       JOIN contactos c ON c.id = q.contacto_id
       WHERE q.estado = 'confirmada'
       GROUP BY c.id, c.nombre
       ORDER BY total DESC
       LIMIT 5`
    ),
    // Nuevas queries añadidas:
    query<{ actuales: number; previos: number }>(
      `SELECT
         count(*) FILTER (WHERE created_at >= now() - interval '30 days')::int AS actuales,
         count(*) FILTER (WHERE created_at >= now() - interval '60 days' AND created_at < now() - interval '30 days')::int AS previos
       FROM contactos`
    ),
    query<{ cantidad: number; saldo: number }>(
      `SELECT count(*)::int AS cantidad, COALESCE(SUM(f.total - COALESCE(p.pagado, 0)), 0)::float AS saldo
       FROM facturas f
       LEFT JOIN (SELECT factura_id, SUM(monto) AS pagado FROM factura_pagos GROUP BY factura_id) p ON p.factura_id = f.id
       WHERE f.estado IN ('enviada', 'vencida') AND (f.total - COALESCE(p.pagado, 0)) > 0`
    ),
    query<{ total: number }>(
      `SELECT COALESCE(SUM(stock * precio), 0)::float AS total FROM productos`
    ),
    query<{ nombre: string; cantidad: number; total: number }>(
      `SELECT COALESCE(p.nombre, l.descripcion) AS nombre, SUM(l.cantidad)::float AS cantidad, SUM(l.subtotal)::float AS total
       FROM cotizacion_lineas l
       JOIN cotizaciones q ON q.id = l.cotizacion_id
       LEFT JOIN productos p ON p.id = l.producto_id
       WHERE q.estado = 'confirmada'
       GROUP BY p.id, p.nombre, l.descripcion
       ORDER BY cantidad DESC
       LIMIT 5`
    ),
    query<{ nombre: string; total: number }>(
      `SELECT p.nombre AS nombre, SUM(e.total)::float AS total
       FROM entradas e
       JOIN proveedores p ON p.id = e.proveedor_id
       WHERE e.estado = 'confirmada'
       GROUP BY p.id, p.nombre
       ORDER BY total DESC
       LIMIT 5`
    ),
    query<{ mes_key: string; total: number }>(
      `SELECT to_char(date_trunc('month', fecha), 'YYYY-MM') AS mes_key, COALESCE(SUM(total), 0)::float AS total
       FROM entradas
       WHERE estado = 'confirmada' AND fecha >= $1::date
       GROUP BY mes_key`,
      [inicioActual]
    ),
  ]);

  const tendenciaGeneral = fillMonthlySeries(buckets, ingresosActualRes.rows);
  const tendenciaPeriodoAnterior = fillMonthlySeries(prevBuckets, ingresosPrevioRes.rows);

  const ingresosActual = tendenciaGeneral.reduce((sum, d) => sum + d.value, 0);
  const ingresosPrevio = tendenciaPeriodoAnterior.reduce((sum, d) => sum + d.value, 0);

  const gastos = gastosAggRes.rows[0];
  const utilidadActual = ingresosActual - gastos.gastos_actual;
  const utilidadPrevio = ingresosPrevio - gastos.gastos_previo;

  const opp = oportunidadesAggRes.rows[0];

  const clientes = clientesRes.rows[0];
  const cuentasCobrar = cobrarRes.rows[0] ?? { cantidad: 0, saldo: 0 };
  const inventarioVal = invValRes.rows[0] ?? { total: 0 };
  
  const margenPromedio = ingresosActual > 0 ? (utilidadActual / ingresosActual) * 100 : 0;
  const margenPromedioPrevio = ingresosPrevio > 0 ? (utilidadPrevio / ingresosPrevio) * 100 : 0;

  const tendenciaCompras = fillMonthlySeries(buckets, comprasRes.rows);

  return NextResponse.json({
    kpis: {
      ingresosTotales: { value: formatCurrency(ingresosActual), ...pctDelta(ingresosActual, ingresosPrevio) },
      gastosTotales: { value: formatCurrency(gastos.gastos_actual), ...pctDelta(gastos.gastos_actual, gastos.gastos_previo) },
      utilidadNeta: { value: formatCurrency(utilidadActual), ...pctDelta(utilidadActual, utilidadPrevio) },
      oportunidadesAbiertas: { value: formatCount(opp.abiertas), ...pctDelta(opp.creadas_30d, opp.creadas_prev30d) },
      margenPromedio: { value: `${margenPromedio.toFixed(1)}%`, deltaLabel: `${(margenPromedio - margenPromedioPrevio).toFixed(1)}% vs anterior`, trend: margenPromedio >= margenPromedioPrevio ? "up" : "down" },
      clientesNuevos: { value: formatCount(clientes.actuales), ...pctDelta(clientes.actuales, clientes.previos) },
      cuentasCobrar: { value: formatCurrency(cuentasCobrar.saldo), deltaLabel: `${cuentasCobrar.cantidad} pendientes` },
      inventarioValorizado: { value: formatCurrency(inventarioVal.total), deltaLabel: "Valor de stock actual" },
    },
    tendenciaGeneral,
    tendenciaPeriodoAnterior,
    tendenciaCompras,
    distribucionIngresos: distribucionRes.rows.map((r) => ({
      label: r.es_empresa ? "Empresas" : "Particulares",
      value: Number(r.total),
      color: r.es_empresa ? "#2C5F9E" : "#7EA1CA",
    })),
    mejoresClientesPorFacturacion: mejoresClientesRes.rows.map((r) => ({
      label: r.nombre,
      value: Number(r.total),
      valueLabel: formatCurrency(Number(r.total)),
    })),
    productosMasVendidos: prodVendidosRes.rows.map((r) => ({
      label: r.nombre || "Sin nombre",
      value: Number(r.cantidad),
      valueLabel: formatCount(Number(r.cantidad)),
    })),
    proveedoresPrincipales: provPrincipalesRes.rows.map((r) => ({
      label: r.nombre || "Proveedor",
      value: Number(r.total),
      valueLabel: formatCurrency(Number(r.total)),
    }))
  });
}
