import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { BalanceGeneral, LineaEstadoContable } from "@/components/contabilidad/types";

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

type FilaCuenta = {
  id: string;
  codigo: string;
  nombre: string;
  tipo: "activo" | "pasivo" | "patrimonio" | "ingreso" | "gasto";
  total_debe: number;
  total_haber: number;
};

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const fecha = searchParams.get("fecha") || hoyISO();

  // Todas las cuentas con movimientos confirmados hasta la fecha de corte (sin límite
  // inferior): activo/pasivo/patrimonio son saldos acumulados desde el inicio, y por
  // eso la utilidad del ejercicio (ver abajo) también debe acumularse desde el inicio
  // para que la ecuación contable siga cuadrando.
  const result = await query<FilaCuenta>(
    `SELECT c.id, c.codigo, c.nombre, c.tipo,
       COALESCE(SUM(l.debe), 0) AS total_debe,
       COALESCE(SUM(l.haber), 0) AS total_haber
     FROM plan_cuentas c
     JOIN asiento_lineas l ON l.cuenta_id = c.id
     JOIN asientos_contables a ON a.id = l.asiento_id
     WHERE a.estado = 'confirmado'
       AND a.fecha <= $1
     GROUP BY c.id, c.codigo, c.nombre, c.tipo
     ORDER BY c.tipo, c.codigo`,
    [fecha]
  );

  const toLinea = (fila: FilaCuenta, monto: number): LineaEstadoContable => ({
    cuenta_id: fila.id,
    codigo: fila.codigo,
    nombre: fila.nombre,
    monto,
  });

  // Activo: saldo deudor (debe - haber). Pasivo/Patrimonio: saldo acreedor (haber - debe).
  const activos = result.rows
    .filter((f) => f.tipo === "activo")
    .map((f) => toLinea(f, Number(f.total_debe) - Number(f.total_haber)));

  const pasivos = result.rows
    .filter((f) => f.tipo === "pasivo")
    .map((f) => toLinea(f, Number(f.total_haber) - Number(f.total_debe)));

  const patrimonios = result.rows
    .filter((f) => f.tipo === "patrimonio")
    .map((f) => toLinea(f, Number(f.total_haber) - Number(f.total_debe)));

  const totalActivo = activos.reduce((sum, l) => sum + l.monto, 0);
  const totalPasivo = pasivos.reduce((sum, l) => sum + l.monto, 0);
  const totalPatrimonio = patrimonios.reduce((sum, l) => sum + l.monto, 0);

  // Simplificación: no hay todavía un cierre de periodo que traslade el resultado a
  // Resultados Acumulados, así que la utilidad del ejercicio se calcula en vivo aquí
  // (mismo cálculo que el Estado de Resultados, acumulado desde el inicio hasta
  // "fecha") y se expone como línea aparte bajo patrimonio para que el balance cuadre
  // visualmente: activo = pasivo + patrimonio + utilidad del ejercicio.
  const totalIngresos = result.rows
    .filter((f) => f.tipo === "ingreso")
    .reduce((sum, f) => sum + (Number(f.total_haber) - Number(f.total_debe)), 0);
  const totalGastos = result.rows
    .filter((f) => f.tipo === "gasto")
    .reduce((sum, f) => sum + (Number(f.total_debe) - Number(f.total_haber)), 0);
  const utilidadEjercicio = totalIngresos - totalGastos;

  const totalPasivoPatrimonio = totalPasivo + totalPatrimonio + utilidadEjercicio;

  const body: BalanceGeneral = {
    fecha,
    activos,
    pasivos,
    patrimonios,
    totalActivo,
    totalPasivo,
    totalPatrimonio,
    utilidadEjercicio,
    totalPasivoPatrimonio,
    cuadra: Math.abs(totalActivo - totalPasivoPatrimonio) < 0.01,
  };

  return NextResponse.json(body);
}
