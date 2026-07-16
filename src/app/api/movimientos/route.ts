import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

// El "cuaderno": todo movimiento de stock ya confirmado (entradas, salidas, ajustes),
// más nuevo primero, con los nombres ya resueltos para no tener que pedirlos aparte.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await query(
    `SELECT
       m.id, m.producto_id, pr.nombre as producto_nombre,
       m.almacen_id, al.nombre as almacen_nombre,
       m.lote_id, lo.numero_lote as lote_numero,
       m.tipo, m.cantidad, m.motivo, m.entrada_id, m.fecha, m.created_at
     FROM movimientos_stock m
     LEFT JOIN productos pr ON m.producto_id = pr.id
     LEFT JOIN almacenes al ON m.almacen_id = al.id
     LEFT JOIN lotes lo ON m.lote_id = lo.id
     ORDER BY m.fecha DESC, m.created_at DESC`
  );

  return NextResponse.json(result.rows);
}
