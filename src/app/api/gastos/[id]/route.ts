import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Gasto } from "@/components/gastos/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { concepto, categoria, monto, fecha, estado, notas, comprobante_url } =
    body as Omit<Gasto, "id" | "created_at">;

  const result = await query<Gasto>(
    `UPDATE gastos SET
       concepto = $1, categoria = $2, monto = $3, fecha = $4,
       estado = $5, notas = $6, comprobante_url = $7
     WHERE id = $8
     RETURNING *`,
    [concepto, categoria, monto, fecha, estado, notas || null, comprobante_url || null, id]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const result = await query("DELETE FROM gastos WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Gasto no encontrado" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
