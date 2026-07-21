import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatCurrency, formatCount } from "../helpers";

// Datos reales para la pestaña Inventario de Gráficos: catálogo (`productos`), lotes y
// almacenes (sql/023_inventario_catalogos.sql, sql/024_inventario_movimientos.sql). El
// esquema no tiene un concepto de stock "reservado" (no hay tabla de reservas ni de
// salidas en espera -- una Salida descuenta el lote al confirmarse, ver
// src/app/api/movimientos/salidas/route.ts) -- los KPIs y el desglose por almacén del mock
// se adaptan a dimensiones que sí existen:
//   - "Stock reservado" -> "Bajo el límite de stock" (productos.stock <= productos.limite_stock,
//     el mismo umbral que ya usa StockResumen.tsx en el módulo Stock).
//   - "Valor reservado" -> "Valor de inventario" (SUM(stock * costo) de productos rastreados).
//   - "Stock disponible y reservado por almacén" -> "Stock por categoría y almacén"
//     (no hay disponible/reservado real; sí hay `productos.categoria`, así que el
//     desglose por almacén usa esa dimensión real en su lugar).
// Ninguno de estos KPIs tiene una foto histórica con la que compararlo honestamente (no
// existe una tabla de snapshots de inventario), así que no llevan flecha de tendencia.

const CATEGORIAS_STOCK_MAX = 6;
const CATEGORIAS_ALMACEN_MAX = 3;
const PALETA_CATEGORIAS = ["#B8860B", "#CBA13F", "#DEBC73"];
const PALETA_ALMACENES = ["#B8860B", "#CBA13F", "#DEBC73", "#A98B4F", "#8C6B2F"];
const COLOR_OTROS = "#9CA3AF";

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

  const [resumenRes, categoriaRes, almacenCategoriaRes, almacenValorRes] = await Promise.all([
    query<{
      total_productos: number;
      total_rastreados: number;
      bajo_limite: number;
      stock_negativo: number;
      valor_inventario: number;
      unidades_totales: number;
    }>(
      `SELECT
         count(*)::int AS total_productos,
         count(*) FILTER (WHERE rastrear_inventario = true)::int AS total_rastreados,
         count(*) FILTER (WHERE rastrear_inventario = true AND stock <= limite_stock)::int AS bajo_limite,
         count(*) FILTER (WHERE stock < 0)::int AS stock_negativo,
         COALESCE(SUM(stock * costo) FILTER (WHERE rastrear_inventario = true), 0)::float AS valor_inventario,
         COALESCE(SUM(stock) FILTER (WHERE rastrear_inventario = true), 0)::float AS unidades_totales
       FROM productos`
    ),
    query<{ categoria: string; total: number }>(
      `SELECT COALESCE(p.categoria, 'Sin categoría') AS categoria, SUM(p.stock)::float AS total
       FROM productos p
       WHERE p.rastrear_inventario = true
       GROUP BY p.categoria
       ORDER BY total DESC`
    ),
    query<{ almacen: string; categoria: string; total: number }>(
      `SELECT a.nombre AS almacen, COALESCE(pr.categoria, 'Sin categoría') AS categoria, COALESCE(SUM(l.cantidad_actual), 0)::float AS total
       FROM lotes l
       JOIN almacenes a ON a.id = l.almacen_id
       JOIN productos pr ON pr.id = l.producto_id
       WHERE l.cantidad_actual > 0
       GROUP BY a.id, a.nombre, pr.categoria
       ORDER BY a.nombre ASC`
    ),
    query<{ almacen: string; valor: number }>(
      `SELECT a.nombre AS almacen, COALESCE(SUM(l.cantidad_actual * l.costo_unitario), 0)::float AS valor
       FROM lotes l
       JOIN almacenes a ON a.id = l.almacen_id
       WHERE l.cantidad_actual > 0
       GROUP BY a.id, a.nombre
       ORDER BY valor DESC`
    ),
  ]);

  const resumen = resumenRes.rows[0] ?? {
    total_productos: 0,
    total_rastreados: 0,
    bajo_limite: 0,
    stock_negativo: 0,
    valor_inventario: 0,
    unidades_totales: 0,
  };

  const totalRastreados = Number(resumen.total_rastreados);
  const bajoLimite = Number(resumen.bajo_limite);
  const pctBajoLimite = totalRastreados > 0 ? (bajoLimite / totalRastreados) * 100 : 0;
  const valorInventario = Number(resumen.valor_inventario);
  const unidadesTotales = Number(resumen.unidades_totales);
  const costoPromedio = unidadesTotales > 0 ? valorInventario / unidadesTotales : 0;
  const stockNegativo = Number(resumen.stock_negativo);

  // --- Stock por categoría (top N + "Otros")
  const categorias = categoriaRes.rows.map((r) => ({ categoria: r.categoria, total: Number(r.total) }));
  const topStock = categorias.slice(0, CATEGORIAS_STOCK_MAX);
  const restoStock = categorias.slice(CATEGORIAS_STOCK_MAX);
  const stockPorCategoria = [
    ...topStock.map((c) => ({ label: c.categoria, value: c.total })),
    ...(restoStock.length > 0 ? [{ label: "Otros", value: restoStock.reduce((s, c) => s + c.total, 0) }] : []),
  ];

  // --- Stock por almacén, desglosado por categoría (sustituye disponible/reservado, que
  // no existe en este esquema)
  const categoriaTotalesAlmacen = new Map<string, number>();
  const porAlmacen = new Map<string, Map<string, number>>();
  const ordenAlmacenes: string[] = [];
  for (const row of almacenCategoriaRes.rows) {
    const total = Number(row.total);
    categoriaTotalesAlmacen.set(row.categoria, (categoriaTotalesAlmacen.get(row.categoria) ?? 0) + total);
    if (!porAlmacen.has(row.almacen)) {
      porAlmacen.set(row.almacen, new Map());
      ordenAlmacenes.push(row.almacen);
    }
    porAlmacen.get(row.almacen)!.set(row.categoria, total);
  }

  const categoriasAlmacenOrdenadas = [...categoriaTotalesAlmacen.entries()].sort((a, b) => b[1] - a[1]);
  const topCategoriasAlmacen = categoriasAlmacenOrdenadas.slice(0, CATEGORIAS_ALMACEN_MAX).map(([cat]) => cat);
  const hayOtrasCategorias = categoriasAlmacenOrdenadas.length > CATEGORIAS_ALMACEN_MAX;

  const stockLegend = topCategoriasAlmacen.map((cat, i) => ({
    key: slugify(cat),
    label: cat,
    color: PALETA_CATEGORIAS[i % PALETA_CATEGORIAS.length],
  }));
  if (hayOtrasCategorias) stockLegend.push({ key: "otros", label: "Otros", color: COLOR_OTROS });

  const stockPorAlmacen = ordenAlmacenes.map((almacen) => {
    const mapa = porAlmacen.get(almacen) ?? new Map<string, number>();
    const segments = topCategoriasAlmacen.map((cat) => ({ key: slugify(cat), value: mapa.get(cat) ?? 0 }));
    if (hayOtrasCategorias) {
      const otros = [...mapa.entries()].filter(([cat]) => !topCategoriasAlmacen.includes(cat)).reduce((s, [, v]) => s + v, 0);
      segments.push({ key: "otros", value: otros });
    }
    return { label: almacen, segments };
  });

  // --- Distribución del valor de inventario por almacén
  const distribucionPorAlmacen = almacenValorRes.rows.map((r, i) => ({
    label: r.almacen,
    value: Math.round(Number(r.valor) * 100) / 100,
    color: PALETA_ALMACENES[i % PALETA_ALMACENES.length],
  }));

  return NextResponse.json({
    kpis: {
      productosActivos: { value: formatCount(Number(resumen.total_productos)) },
      bajoLimite: {
        value: `${pctBajoLimite.toFixed(1)}%`,
        deltaLabel: `${formatCount(bajoLimite)} de ${formatCount(totalRastreados)} productos rastreados`,
      },
      valorInventario: {
        value: formatCurrency(valorInventario),
        deltaLabel: `Costo promedio ${formatCurrency(costoPromedio)} por unidad`,
      },
      stockNegativo: {
        value: formatCount(stockNegativo),
        deltaLabel: stockNegativo > 0 ? "Requieren ajuste de inventario" : "Sin inconsistencias",
      },
    },
    stockPorCategoria,
    stockPorAlmacen,
    stockLegend,
    distribucionPorAlmacen,
  });
}
