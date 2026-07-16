import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Proveedor } from "@/components/proveedores/types";

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
  const { nombre, ruc, contacto, telefono, email, notas } =
    body as Omit<Proveedor, "id" | "created_at" | "updated_at">;

  const result = await query<Proveedor>(
    `UPDATE proveedores SET
       nombre = $1, ruc = $2, contacto = $3, telefono = $4, email = $5, notas = $6
     WHERE id = $7
     RETURNING *`,
    [nombre, ruc || null, contacto || null, telefono || null, email || null, notas || null, id]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
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
  const result = await query(`DELETE FROM proveedores WHERE id = $1 RETURNING id`, [id]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
