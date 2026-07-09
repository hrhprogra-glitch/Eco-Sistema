import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

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
    `SELECT producto_id, cantidad FROM piscina_consumos WHERE id = $1`,
    [itemId]
  );
  const current = currentResult.rows[0];
  if (!current) {
    return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
  }

  if (current.producto_id) {
    await query(`UPDATE productos SET stock = stock + $1 WHERE id = $2`, [
      current.cantidad,
      current.producto_id,
    ]);
  }

  await query(`DELETE FROM piscina_consumos WHERE id = $1`, [itemId]);

  return new NextResponse(null, { status: 204 });
}
