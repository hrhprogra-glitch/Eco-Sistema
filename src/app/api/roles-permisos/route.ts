import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Rol } from "@/components/roles-permisos/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await query<Rol>("SELECT * FROM roles ORDER BY nombre ASC");
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { nombre, descripcion, permisos } = body as Omit<Rol, "id" | "created_at" | "updated_at">;

  if (!nombre || !nombre.trim()) {
    return NextResponse.json({ error: "El nombre del rol es requerido." }, { status: 400 });
  }

  try {
    const result = await query<Rol>(
      `INSERT INTO roles (nombre, descripcion, permisos)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre, descripcion || null, permisos && permisos.length > 0 ? permisos : null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err: any) {
    if (err.code === "23505") {
      return NextResponse.json({ error: "Ya existe un rol con ese nombre." }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
