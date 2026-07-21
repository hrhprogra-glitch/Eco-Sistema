import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import type { AsientoContable } from "@/components/contabilidad/types";

// Libro Diario: lista cronológica de TODOS los asientos (borrador y confirmado —
// es el libro de trabajo) con sus líneas, filtrable por rango de fechas opcional.
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const desde = searchParams.get("desde") || "0001-01-01";
  const hasta = searchParams.get("hasta") || "9999-12-31";

  const result = await pool.query<AsientoContable>(
    `SELECT a.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', l.id, 'asiento_id', l.asiento_id, 'cuenta_id', l.cuenta_id,
            'debe', l.debe, 'haber', l.haber, 'descripcion', l.descripcion,
            'created_at', l.created_at,
            'cuenta_codigo', c.codigo, 'cuenta_nombre', c.nombre
          ) ORDER BY l.id
        ) FILTER (WHERE l.id IS NOT NULL), '[]'
      ) AS lineas
    FROM asientos_contables a
    LEFT JOIN asiento_lineas l ON l.asiento_id = a.id
    LEFT JOIN plan_cuentas c ON c.id = l.cuenta_id
    WHERE a.fecha BETWEEN $1 AND $2
    GROUP BY a.id
    ORDER BY a.fecha ASC, a.numero ASC`,
    [desde, hasta]
  );

  return NextResponse.json(result.rows);
}
