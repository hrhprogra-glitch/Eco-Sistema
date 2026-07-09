import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { PiscinaMaterial, PiscinaMaterialInput } from "@/components/piscina/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; materialId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { materialId } = await params;
  const body = await request.json();
  const { nombre_material, cantidad, monto, fecha, notas } = body as PiscinaMaterialInput;

  const updated = await query<PiscinaMaterial>(
    `UPDATE piscina_materiales SET
       nombre_material = $1, cantidad = $2, monto = $3, fecha = $4, notas = $5
     WHERE id = $6
     RETURNING id, piscina_id, nombre_material, cantidad, monto, fecha, notas, created_at`,
    [nombre_material, cantidad, monto, fecha, notas ?? "", materialId]
  );

  if (updated.rowCount === 0) {
    return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
  }

  return NextResponse.json(updated.rows[0]);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; materialId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { materialId } = await params;
  const result = await query("DELETE FROM piscina_materiales WHERE id = $1", [materialId]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
