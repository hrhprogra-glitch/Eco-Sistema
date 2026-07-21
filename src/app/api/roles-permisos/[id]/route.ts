import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Rol } from "@/components/roles-permisos/types";

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
  const { nombre, descripcion, permisos } = body as Omit<Rol, "id" | "created_at" | "updated_at">;

  if (!nombre || !nombre.trim()) {
    return NextResponse.json({ error: "El nombre del rol es requerido." }, { status: 400 });
  }

  try {
    const result = await query<Rol>(
      `UPDATE roles
       SET nombre = $1, descripcion = $2, permisos = $3, updated_at = now()
       WHERE id = $4
       RETURNING *`,
      [nombre, descripcion || null, permisos && permisos.length > 0 ? permisos : null, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      return NextResponse.json({ error: "Ya existe un rol con ese nombre." }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
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
  const result = await query("DELETE FROM roles WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
