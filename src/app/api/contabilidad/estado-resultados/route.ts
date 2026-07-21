import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { EstadoResultados, LineaEstadoContable } from "@/components/contabilidad/types";

function primerDiaDelMes(): string {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);
}

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

type FilaCuenta = {
  id: string;
  codigo: string;
  nombre: string;
  tipo: "ingreso" | "gasto";
  total_debe: number;
  total_haber: number;
};

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const desde = searchParams.get("desde") || primerDiaDelMes();
  const hasta = searchParams.get("hasta") || hoyISO();

  // Solo cuentas de ingreso/gasto, solo líneas de asientos confirmados dentro del rango.
  const result = await query<FilaCuenta>(
    `SELECT c.id, c.codigo, c.nombre, c.tipo,
       COALESCE(SUM(l.debe), 0) AS total_debe,
       COALESCE(SUM(l.haber), 0) AS total_haber
     FROM plan_cuentas c
     JOIN asiento_lineas l ON l.cuenta_id = c.id
     JOIN asientos_contables a ON a.id = l.asiento_id
     WHERE c.tipo IN ('ingreso', 'gasto')
       AND a.estado = 'confirmado'
       AND a.fecha BETWEEN $1 AND $2
     GROUP BY c.id, c.codigo, c.nombre, c.tipo
     ORDER BY c.tipo, c.codigo`,
    [desde, hasta]
  );

  const toLinea = (fila: FilaCuenta, monto: number): LineaEstadoContable => ({
    cuenta_id: fila.id,
    codigo: fila.codigo,
    nombre: fila.nombre,
    monto,
  });

  // Ingresos: saldo acreedor (haber - debe). Gastos: saldo deudor (debe - haber).
  const ingresos = result.rows
    .filter((f) => f.tipo === "ingreso")
    .map((f) => toLinea(f, Number(f.total_haber) - Number(f.total_debe)));

  const gastos = result.rows
    .filter((f) => f.tipo === "gasto")
    .map((f) => toLinea(f, Number(f.total_debe) - Number(f.total_haber)));

  const totalIngresos = ingresos.reduce((sum, l) => sum + l.monto, 0);
  const totalGastos = gastos.reduce((sum, l) => sum + l.monto, 0);

  const body: EstadoResultados = {
    desde,
    hasta,
    ingresos,
    gastos,
    totalIngresos,
    totalGastos,
    utilidadNeta: totalIngresos - totalGastos,
  };

  return NextResponse.json(body);
}
