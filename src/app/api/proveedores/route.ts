import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Proveedor } from "@/components/proveedores/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await query<Proveedor>(
    `SELECT * FROM proveedores ORDER BY nombre ASC`
  );
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { nombre, ruc, contacto, telefono, email, notas } =
    body as Omit<Proveedor, "id" | "created_at" | "updated_at">;

  const result = await query<Proveedor>(
    `INSERT INTO proveedores (nombre, ruc, contacto, telefono, email, notas)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [nombre, ruc || null, contacto || null, telefono || null, email || null, notas || null]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}
