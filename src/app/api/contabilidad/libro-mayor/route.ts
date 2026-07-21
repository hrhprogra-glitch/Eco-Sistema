import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import type { CuentaContable } from "@/components/contabilidad/types";
import type { LibroMayorResponse, MovimientoMayor } from "@/components/contabilidad/librosTypes";

// Libro Mayor: movimientos CONFIRMADOS de una cuenta puntual, en orden cronológico,
// con saldo acumulado y saldo de apertura/cierre del período pedido.
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cuentaId = searchParams.get("cuenta_id");
  if (!cuentaId) {
    return NextResponse.json({ error: "Falta el parámetro cuenta_id" }, { status: 400 });
  }

  const desdeParam = searchParams.get("desde");
  const hastaParam = searchParams.get("hasta");
  const desde = desdeParam || "0001-01-01";
  const hasta = hastaParam || "9999-12-31";

  const cuentaResult = await pool.query<CuentaContable>(`SELECT * FROM plan_cuentas WHERE id = $1`, [cuentaId]);
  const cuenta = cuentaResult.rows[0];
  if (!cuenta) {
    return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
  }

  // Cuentas de naturaleza deudora (activo/gasto) suman con el debe; el resto
  // (pasivo/patrimonio/ingreso) son de naturaleza acreedora y suman con el haber.
  const esDeudora = cuenta.tipo === "activo" || cuenta.tipo === "gasto";

  const previoResult = await pool.query<{ total_debe: number; total_haber: number }>(
    `SELECT COALESCE(SUM(l.debe),0) AS total_debe, COALESCE(SUM(l.haber),0) AS total_haber
     FROM asiento_lineas l
     JOIN asientos_contables a ON a.id = l.asiento_id
     WHERE l.cuenta_id = $1 AND a.estado = 'confirmado' AND a.fecha < $2`,
    [cuentaId, desde]
  );
  const previo = previoResult.rows[0];
  const saldoInicial = esDeudora
    ? Number(previo.total_debe) - Number(previo.total_haber)
    : Number(previo.total_haber) - Number(previo.total_debe);

  const movResult = await pool.query<{
    asiento_id: string;
    numero: number;
    fecha: string;
    asiento_descripcion: string;
    linea_descripcion: string | null;
    debe: number;
    haber: number;
  }>(
    `SELECT a.id AS asiento_id, a.numero, a.fecha, a.descripcion AS asiento_descripcion,
        l.descripcion AS linea_descripcion, l.debe, l.haber
     FROM asiento_lineas l
     JOIN asientos_contables a ON a.id = l.asiento_id
     WHERE l.cuenta_id = $1 AND a.estado = 'confirmado' AND a.fecha BETWEEN $2 AND $3
     ORDER BY a.fecha ASC, a.numero ASC, l.id ASC`,
    [cuentaId, desde, hasta]
  );

  let saldo = saldoInicial;
  const movimientos: MovimientoMayor[] = movResult.rows.map((m) => {
    const delta = esDeudora ? Number(m.debe) - Number(m.haber) : Number(m.haber) - Number(m.debe);
    saldo += delta;
    return {
      asiento_id: m.asiento_id,
      numero: Number(m.numero),
      fecha: m.fecha,
      asiento_descripcion: m.asiento_descripcion,
      linea_descripcion: m.linea_descripcion,
      debe: Number(m.debe),
      haber: Number(m.haber),
      saldo,
    };
  });

  const response: LibroMayorResponse = {
    cuenta,
    desde: desdeParam,
    hasta: hastaParam,
    saldo_inicial: saldoInicial,
    saldo_final: saldo,
    movimientos,
  };

  return NextResponse.json(response);
}
