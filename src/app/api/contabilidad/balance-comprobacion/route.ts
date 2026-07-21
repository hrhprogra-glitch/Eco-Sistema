import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import type { TipoCuenta } from "@/components/contabilidad/types";
import type { BalanceComprobacionFila, BalanceComprobacionResponse } from "@/components/contabilidad/librosTypes";

const TIPOS_DEUDORES: TipoCuenta[] = ["activo", "gasto"];

// Balance de Comprobación: una fila por cuenta con al menos un movimiento
// CONFIRMADO (dentro del rango de fechas opcional), con total debe/haber y
// saldo según naturaleza de la cuenta, más la fila de totales.
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const desdeParam = searchParams.get("desde");
  const hastaParam = searchParams.get("hasta");
  const desde = desdeParam || "0001-01-01";
  const hasta = hastaParam || "9999-12-31";

  const result = await pool.query<{
    cuenta_id: string;
    codigo: string;
    nombre: string;
    tipo: TipoCuenta;
    total_debe: number;
    total_haber: number;
  }>(
    `SELECT c.id AS cuenta_id, c.codigo, c.nombre, c.tipo,
        COALESCE(SUM(l.debe),0) AS total_debe, COALESCE(SUM(l.haber),0) AS total_haber
     FROM asiento_lineas l
     JOIN asientos_contables a ON a.id = l.asiento_id
     JOIN plan_cuentas c ON c.id = l.cuenta_id
     WHERE a.estado = 'confirmado' AND a.fecha BETWEEN $1 AND $2
     GROUP BY c.id, c.codigo, c.nombre, c.tipo
     ORDER BY c.codigo`,
    [desde, hasta]
  );

  const filas: BalanceComprobacionFila[] = result.rows.map((r) => {
    const esDeudora = TIPOS_DEUDORES.includes(r.tipo);
    const totalDebe = Number(r.total_debe);
    const totalHaber = Number(r.total_haber);
    return {
      cuenta_id: r.cuenta_id,
      codigo: r.codigo,
      nombre: r.nombre,
      tipo: r.tipo,
      total_debe: totalDebe,
      total_haber: totalHaber,
      saldo: esDeudora ? totalDebe - totalHaber : totalHaber - totalDebe,
    };
  });

  const totales = filas.reduce(
    (acc, f) => ({ total_debe: acc.total_debe + f.total_debe, total_haber: acc.total_haber + f.total_haber }),
    { total_debe: 0, total_haber: 0 }
  );

  const response: BalanceComprobacionResponse = { desde: desdeParam, hasta: hastaParam, filas, totales };
  return NextResponse.json(response);
}
