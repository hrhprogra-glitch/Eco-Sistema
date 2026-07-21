import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import type { CambioPatrimonioFila, CambiosPatrimonioResponse } from "@/components/contabilidad/librosTypes";

// Estado de Cambios en el Patrimonio: para cada cuenta tipo='patrimonio', saldo de
// apertura (movimientos CONFIRMADOS antes de "desde"), movimiento neto del período
// y saldo de cierre. Las cuentas de patrimonio son de naturaleza acreedora
// (saldo = haber - debe).
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
    saldo_inicial: number;
    movimiento_neto: number;
  }>(
    `SELECT c.id AS cuenta_id, c.codigo, c.nombre,
        COALESCE(SUM(CASE WHEN a.estado = 'confirmado' AND a.fecha < $1 THEN l.haber - l.debe ELSE 0 END), 0) AS saldo_inicial,
        COALESCE(SUM(CASE WHEN a.estado = 'confirmado' AND a.fecha BETWEEN $1 AND $2 THEN l.haber - l.debe ELSE 0 END), 0) AS movimiento_neto
     FROM plan_cuentas c
     LEFT JOIN asiento_lineas l ON l.cuenta_id = c.id
     LEFT JOIN asientos_contables a ON a.id = l.asiento_id
     WHERE c.tipo = 'patrimonio'
     GROUP BY c.id, c.codigo, c.nombre
     ORDER BY c.codigo`,
    [desde, hasta]
  );

  const filas: CambioPatrimonioFila[] = result.rows.map((r) => {
    const saldoInicial = Number(r.saldo_inicial);
    const movimientoNeto = Number(r.movimiento_neto);
    return {
      cuenta_id: r.cuenta_id,
      codigo: r.codigo,
      nombre: r.nombre,
      saldo_inicial: saldoInicial,
      movimiento_neto: movimientoNeto,
      saldo_final: saldoInicial + movimientoNeto,
    };
  });

  const totales = filas.reduce(
    (acc, f) => ({
      saldo_inicial: acc.saldo_inicial + f.saldo_inicial,
      movimiento_neto: acc.movimiento_neto + f.movimiento_neto,
      saldo_final: acc.saldo_final + f.saldo_final,
    }),
    { saldo_inicial: 0, movimiento_neto: 0, saldo_final: 0 }
  );

  const response: CambiosPatrimonioResponse = { desde: desdeParam, hasta: hastaParam, filas, totales };
  return NextResponse.json(response);
}
