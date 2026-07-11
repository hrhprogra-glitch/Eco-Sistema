import type { ChartDatum, DonutDatum } from "./types";

// Datos de ejemplo: ninguna sesión de negocio tiene datos reales conectados
// todavía, así que estos gráficos usan valores de muestra hasta que existan.

export const ventasPorMes: ChartDatum[] = [
  { label: "Feb", value: 42000 },
  { label: "Mar", value: 51000 },
  { label: "Abr", value: 47500 },
  { label: "May", value: 60200 },
  { label: "Jun", value: 55800 },
  { label: "Jul", value: 63100 },
];

export const oportunidadesPorEtapa: DonutDatum[] = [
  { label: "Prospección", value: 18, color: "#714B67" },
  { label: "Calificación", value: 12, color: "#95688F" },
  { label: "Propuesta", value: 7, color: "#B98CB3" },
  { label: "Cierre", value: 4, color: "#DDB0D7" },
];

export const ingresosPorMes: ChartDatum[] = [
  { label: "Feb", value: 68000 },
  { label: "Mar", value: 72500 },
  { label: "Abr", value: 69800 },
  { label: "May", value: 81200 },
  { label: "Jun", value: 77400 },
  { label: "Jul", value: 85900 },
];

export const gastosPorCategoria: DonutDatum[] = [
  { label: "Nómina", value: 32, color: "#2C5F9E" },
  { label: "Insumos", value: 21, color: "#5580B4" },
  { label: "Servicios", value: 14, color: "#7EA1CA" },
  { label: "Otros", value: 9, color: "#A7C2E0" },
];

export const stockPorCategoria: ChartDatum[] = [
  { label: "Químicos", value: 320 },
  { label: "Repuestos", value: 210 },
  { label: "Herram.", value: 145 },
  { label: "Limpieza", value: 190 },
  { label: "Otros", value: 95 },
];

export const distribucionPorAlmacen: DonutDatum[] = [
  { label: "Almacén central", value: 540, color: "#B8860B" },
  { label: "Depósito norte", value: 260, color: "#CBA13F" },
  { label: "Depósito sur", value: 180, color: "#DEBC73" },
];

export const distribucionIngresosPorArea: DonutDatum[] = [
  { label: "Comercial", value: 63100, color: "#714B67" },
  { label: "Finanzas", value: 85900, color: "#2C5F9E" },
  { label: "Inventario", value: 24500, color: "#B8860B" },
];

export const tendenciaGeneral: ChartDatum[] = [
  { label: "Feb", value: 110000 },
  { label: "Mar", value: 123500 },
  { label: "Abr", value: 117300 },
  { label: "May", value: 141400 },
  { label: "Jun", value: 133200 },
  { label: "Jul", value: 149000 },
];
