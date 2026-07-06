import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Empleado } from "@/components/empleados/types";

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
  const {
    nombre,
    puesto,
    area,
    foto_url,
    email_trabajo,
    telefono_trabajo,
    jefe_directo,
    dni,
    dni_foto_url,
    monto_pago,
  } = body as Omit<Empleado, "id" | "created_at">;

  const result = await query<Empleado>(
    `UPDATE empleados SET
       nombre = $1, puesto = $2, area = $3, foto_url = $4, email_trabajo = $5,
       telefono_trabajo = $6, jefe_directo = $7, dni = $8, dni_foto_url = $9,
       monto_pago = $10
     WHERE id = $11
     RETURNING *`,
    [
      nombre,
      puesto,
      area,
      foto_url,
      email_trabajo,
      telefono_trabajo,
      jefe_directo,
      dni,
      dni_foto_url,
      monto_pago,
      id,
    ]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 });
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
  const result = await query("DELETE FROM empleados WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
