import {
  TrendingUp,
  ShoppingCart,
  Receipt,
  Target,
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  Package,
  PackageCheck,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import type { ChartDatum, DonutDatum, KpiDatum, RankedDatum, StackedSeriesDatum, StackedSeriesLegend } from "./types";

// Datos de ejemplo: ninguna sesión de negocio tiene datos reales conectados
// todavía, así que estos gráficos usan valores de muestra hasta que existan.

// --- Comercial (Ventas + CRM) ---

export const comercialKpis: KpiDatum[] = [
  { label: "Cotizaciones", value: "189", icon: Receipt, color: "#714B67", deltaLabel: "53.7% vs periodo anterior", trend: "up" },
  { label: "Pedidos", value: "456", icon: ShoppingCart, color: "#2C5F9E", deltaLabel: "32.2% vs periodo anterior", trend: "up" },
  { label: "Ingresos (30d)", value: "$491,617", icon: TrendingUp, color: "#00838F", deltaLabel: "40.5% vs periodo anterior", trend: "up" },
  { label: "Oportunidades abiertas", value: "57", icon: Target, color: "#B8860B", deltaLabel: "4.2% vs periodo anterior", trend: "down" },
];

export const ventasPorMes: ChartDatum[] = [
  { label: "Feb", value: 850000 },
  { label: "Mar", value: 980000 },
  { label: "Abr", value: 1200000 },
  { label: "May", value: 1450000 },
  { label: "Jun", value: 1760000 },
  { label: "Jul", value: 1950000 },
];

export const mejoresVendedoresPorIngresos: RankedDatum[] = [
  { label: "Lucía Fernández", value: 148000, valueLabel: "$148,000" },
  { label: "Martín Gómez", value: 143500, valueLabel: "$143,500" },
  { label: "Sofía Ramírez", value: 139200, valueLabel: "$139,200" },
  { label: "Diego Torres", value: 124800, valueLabel: "$124,800" },
  { label: "Valentina Ruiz", value: 96500, valueLabel: "$96,500" },
];

export const oportunidadesPorEtapa: DonutDatum[] = [
  { label: "Prospección", value: 18, color: "#714B67" },
  { label: "Calificación", value: 12, color: "#95688F" },
  { label: "Propuesta", value: 7, color: "#B98CB3" },
  { label: "Cierre", value: 4, color: "#DDB0D7" },
];

// --- Finanzas (Contabilidad + Gastos) ---

export const finanzasKpis: KpiDatum[] = [
  { label: "Ingresos actuales", value: "$6,489", icon: TrendingUp, color: "#2C5F9E", deltaLabel: "+$5,064 vs periodo anterior", trend: "up" },
  { label: "Cuentas por cobrar", value: "$7,464", icon: ArrowDownToLine, color: "#00838F", deltaLabel: "8.1% vs periodo anterior", trend: "up" },
  { label: "Gastos actuales", value: "$12,500", icon: CreditCard, color: "#B8860B", deltaLabel: "+$12,500 vs periodo anterior", trend: "down" },
  { label: "Cuentas por pagar", value: "$129,500", icon: ArrowUpFromLine, color: "#714B67", deltaLabel: "3.4% vs periodo anterior", trend: "down" },
];

export const facturadoMensual: ChartDatum[] = [
  { label: "Feb", value: 190000 },
  { label: "Mar", value: 216000 },
  { label: "Abr", value: 282000 },
  { label: "May", value: 298000 },
  { label: "Jun", value: 311000 },
  { label: "Jul", value: 372000 },
];

export const gastosPorCategoriaMensual: StackedSeriesDatum[] = [
  { label: "Feb", segments: [{ key: "insumos", value: 400 }, { key: "servicios", value: 1200 }, { key: "otros", value: 1400 }] },
  { label: "Mar", segments: [{ key: "insumos", value: 1350 }, { key: "servicios", value: 650 }, { key: "otros", value: 900 }] },
  { label: "Abr", segments: [{ key: "insumos", value: 650 }, { key: "servicios", value: 600 }, { key: "otros", value: 450 }] },
  { label: "May", segments: [{ key: "insumos", value: 1300 }, { key: "servicios", value: 300 }, { key: "otros", value: 600 }] },
  { label: "Jun", segments: [{ key: "insumos", value: 500 }, { key: "servicios", value: 1500 }, { key: "otros", value: 1100 }] },
  { label: "Jul", segments: [{ key: "insumos", value: 1200 }, { key: "servicios", value: 1400 }, { key: "otros", value: 1600 }] },
];

export const gastosLegend: StackedSeriesLegend[] = [
  { key: "insumos", label: "Insumos", color: "#2C5F9E" },
  { key: "servicios", label: "Servicios", color: "#5580B4" },
  { key: "otros", label: "Otros", color: "#A7C2E0" },
];

export const gastosPorCategoria: DonutDatum[] = [
  { label: "Nómina", value: 32, color: "#2C5F9E" },
  { label: "Insumos", value: 21, color: "#5580B4" },
  { label: "Servicios", value: 14, color: "#7EA1CA" },
  { label: "Otros", value: 9, color: "#A7C2E0" },
];

// --- Inventario ---

export const inventarioKpis: KpiDatum[] = [
  { label: "Productos activos", value: "1,856", icon: Package, color: "#B8860B" },
  { label: "Stock reservado", value: "24.08%", icon: PackageCheck, color: "#2C5F9E", deltaLabel: "447 de 1,856 unidades", trend: "up" },
  { label: "Valor reservado", value: "40.64%", icon: Wallet, color: "#00838F", deltaLabel: "$76,437 de $188,071", trend: "up" },
  { label: "Líneas con stock negativo", value: "6", icon: AlertTriangle, color: "#C2185B" },
];

export const stockPorCategoria: ChartDatum[] = [
  { label: "Químicos", value: 320 },
  { label: "Repuestos", value: 210 },
  { label: "Herram.", value: 145 },
  { label: "Limpieza", value: 190 },
  { label: "Otros", value: 95 },
];

export const stockPorAlmacen: StackedSeriesDatum[] = [
  { label: "Almacén", segments: [{ key: "disponible", value: 3300 }, { key: "reservado", value: 4500 }] },
  { label: "Salida", segments: [{ key: "disponible", value: 550 }, { key: "reservado", value: 4700 }] },
  { label: "Preprod.", segments: [{ key: "disponible", value: 3800 }, { key: "reservado", value: 4500 }] },
  { label: "Posprod.", segments: [{ key: "disponible", value: 2700 }, { key: "reservado", value: 2300 }] },
  { label: "Estante 10", segments: [{ key: "disponible", value: 3400 }, { key: "reservado", value: 1400 }] },
];

export const stockLegend: StackedSeriesLegend[] = [
  { key: "disponible", label: "Disponible", color: "#7EA1CA" },
  { key: "reservado", label: "Reservado", color: "#DEBC73" },
];

export const distribucionPorAlmacen: DonutDatum[] = [
  { label: "Almacén central", value: 540, color: "#B8860B" },
  { label: "Depósito norte", value: 260, color: "#CBA13F" },
  { label: "Depósito sur", value: 180, color: "#DEBC73" },
];

// --- Analítica ---

export const analiticaKpis: KpiDatum[] = [
  { label: "Ingresos totales", value: "$372,000", icon: TrendingUp, color: "#2C5F9E", deltaLabel: "18.3% vs periodo anterior", trend: "up" },
  { label: "Gastos totales", value: "$95,400", icon: CreditCard, color: "#B8860B", deltaLabel: "6.1% vs periodo anterior", trend: "down" },
  { label: "Utilidad neta", value: "$276,600", icon: Wallet, color: "#00838F", deltaLabel: "22.4% vs periodo anterior", trend: "up" },
  { label: "Oportunidades abiertas", value: "57", icon: Target, color: "#714B67" },
];

export const tendenciaGeneral: ChartDatum[] = [
  { label: "Feb", value: 110000 },
  { label: "Mar", value: 123500 },
  { label: "Abr", value: 117300 },
  { label: "May", value: 141400 },
  { label: "Jun", value: 133200 },
  { label: "Jul", value: 149000 },
];

export const tendenciaPeriodoAnterior: ChartDatum[] = [
  { label: "Feb", value: 95000 },
  { label: "Mar", value: 101000 },
  { label: "Abr", value: 108500 },
  { label: "May", value: 112000 },
  { label: "Jun", value: 119800 },
  { label: "Jul", value: 121500 },
];

export const distribucionIngresosPorArea: DonutDatum[] = [
  { label: "Comercial", value: 191700, color: "#714B67" },
  { label: "Finanzas", value: 122500, color: "#2C5F9E" },
  { label: "Inventario", value: 57800, color: "#B8860B" },
];

export const mejoresClientesPorFacturacion: RankedDatum[] = [
  { label: "Constructora Alba S.A.", value: 84200, valueLabel: "$84,200" },
  { label: "Distribuidora Norte", value: 71500, valueLabel: "$71,500" },
  { label: "Grupo Ferretero Sur", value: 63900, valueLabel: "$63,900" },
  { label: "Hotel Las Palmas", value: 52100, valueLabel: "$52,100" },
  { label: "Comercial Ríos Ltda.", value: 41300, valueLabel: "$41,300" },
];
