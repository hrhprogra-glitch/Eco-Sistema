import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import type { CuentaEfectivo, FlujoEfectivoResponse, MovimientoEfectivo } from "@/components/contabilidad/librosTypes";

// Cuentas de "efectivo": código 1000/1010 (Caja/Bancos del plan de cuentas semilla,
// ver sql/006_contabilidad.sql) o cualquier cuenta cuyo nombre contenga Caja/Banco,
// por si se agregan más cuentas de efectivo a futuro (ej. "Bancos - Cuenta 2").
const FILTRO_CUENTAS_EFECTIVO = `(c.codigo LIKE '1000%' OR c.codigo LIKE '1010%' OR c.nombre ILIKE '%caja%' OR c.nombre ILIKE '%banco%')`;

// Estado de Flujo de Efectivo (corte simple): entradas vs salidas de efectivo
// según los movimientos CONFIRMADOS que tocan cuentas de caja/bancos en el rango
// de fechas pedido, sin clasificar por actividad operativa/inversión/financiamiento.
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

  const cuentasResult = await pool.query<CuentaEfectivo>(
    `SELECT c.id AS cuenta_id, c.codigo, c.nombre FROM plan_cuentas c WHERE ${FILTRO_CUENTAS_EFECTIVO} ORDER BY c.codigo`
  );

  const movResult = await pool.query<{
    asiento_id: string;
    numero: number;
    fecha: string;
    descripcion: string;
    cuenta_codigo: string;
    cuenta_nombre: string;
    debe: number;
    haber: number;
  }>(
    `SELECT a.id AS asiento_id, a.numero, a.fecha, a.descripcion,
        c.codigo AS cuenta_codigo, c.nombre AS cuenta_nombre, l.debe, l.haber
     FROM asiento_lineas l
     JOIN asientos_contables a ON a.id = l.asiento_id
     JOIN plan_cuentas c ON c.id = l.cuenta_id
     WHERE a.estado = 'confirmado' AND a.fecha BETWEEN $1 AND $2 AND ${FILTRO_CUENTAS_EFECTIVO}
     ORDER BY a.fecha ASC, a.numero ASC`,
    [desde, hasta]
  );

  const movimientos: MovimientoEfectivo[] = movResult.rows.map((m) => ({
    asiento_id: m.asiento_id,
    numero: Number(m.numero),
    fecha: m.fecha,
    descripcion: m.descripcion,
    cuenta_codigo: m.cuenta_codigo,
    cuenta_nombre: m.cuenta_nombre,
    debe: Number(m.debe),
    haber: Number(m.haber),
  }));

  // En una cuenta de efectivo (activo, naturaleza deudora), un cargo (debe)
  // es entrada de efectivo y un abono (haber) es salida.
  const entradas = movimientos.reduce((sum, m) => sum + m.debe, 0);
  const salidas = movimientos.reduce((sum, m) => sum + m.haber, 0);

  const response: FlujoEfectivoResponse = {
    desde: desdeParam,
    hasta: hastaParam,
    cuentas: cuentasResult.rows,
    entradas,
    salidas,
    neto: entradas - salidas,
    movimientos,
  };

  return NextResponse.json(response);
}
