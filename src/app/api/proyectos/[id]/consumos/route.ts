import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

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
  const { producto_id, nombre_externo, cantidad, justificacion } = body;

  try {
    // 1. Begin logic (using simple queries for now, ideally transaction)
    const result = await query(
      `INSERT INTO proyecto_items 
        (proyecto_id, producto_id, nombre_externo, cantidad, justificacion) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, producto_id || null, nombre_externo || null, cantidad, justificacion || null]
    );

    const newItem = result.rows[0];

    // 2. Deduct inventory if product_id is provided
    if (producto_id) {
      await query(
        `UPDATE productos SET stock = stock - $1 WHERE id = $2`,
        [cantidad, producto_id]
      );
    }

    return NextResponse.json(newItem);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
