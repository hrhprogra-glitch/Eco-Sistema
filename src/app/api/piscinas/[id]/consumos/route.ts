import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { PiscinaConsumo, PiscinaConsumoInput } from "@/components/piscina/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const result = await query<PiscinaConsumo>(
    `SELECT pc.*, pr.nombre AS producto_nombre
     FROM piscina_consumos pc
     LEFT JOIN productos pr ON pr.id = pc.producto_id
     WHERE pc.piscina_id = $1
     ORDER BY pc.created_at DESC`,
    [id]
  );
  return NextResponse.json(result.rows);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { producto_id, nombre_externo, cantidad, notas } = body as PiscinaConsumoInput;

  if (!cantidad || cantidad <= 0) {
    return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
  }

  const inserted = await query<{ id: number }>(
    `INSERT INTO piscina_consumos (piscina_id, producto_id, nombre_externo, cantidad, notas)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [id, producto_id || null, nombre_externo || null, cantidad, notas || null]
  );

  if (producto_id) {
    await query(`UPDATE productos SET stock = stock - $1 WHERE id = $2`, [
      cantidad,
      producto_id,
    ]);
  }

  const result = await query<PiscinaConsumo>(
    `SELECT pc.*, pr.nombre AS producto_nombre
     FROM piscina_consumos pc
     LEFT JOIN productos pr ON pr.id = pc.producto_id
     WHERE pc.id = $1`,
    [inserted.rows[0].id]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}
