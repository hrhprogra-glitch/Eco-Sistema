import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { itemId } = await params;
  const body = await request.json();
  const { cantidad } = body as { cantidad: number };

  if (!cantidad || cantidad <= 0) {
    return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
  }

  const currentResult = await query<{ producto_id: number | null; cantidad: number }>(
    `SELECT producto_id, cantidad FROM proyecto_items WHERE id = $1`,
    [itemId]
  );
  const current = currentResult.rows[0];
  if (!current) {
    return NextResponse.json({ error: "Material no encontrado" }, { status: 404 });
  }

  if (current.producto_id) {
    const delta = cantidad - current.cantidad;
    await query(`UPDATE productos SET stock = stock - $1 WHERE id = $2`, [
      delta,
      current.producto_id,
    ]);
  }

  const result = await query(
    `UPDATE proyecto_items SET cantidad = $1 WHERE id = $2 RETURNING *`,
    [cantidad, itemId]
  );

  return NextResponse.json(result.rows[0]);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { itemId } = await params;

  const currentResult = await query<{ producto_id: number | null; cantidad: number }>(
    `SELECT producto_id, cantidad FROM proyecto_items WHERE id = $1`,
    [itemId]
  );
  const current = currentResult.rows[0];
  if (!current) {
    return NextResponse.json({ error: "Material no encontrado" }, { status: 404 });
  }

  if (current.producto_id) {
    await query(`UPDATE productos SET stock = stock + $1 WHERE id = $2`, [
      current.cantidad,
      current.producto_id,
    ]);
  }

  await query(`DELETE FROM proyecto_items WHERE id = $1`, [itemId]);

  return NextResponse.json({ success: true });
}
