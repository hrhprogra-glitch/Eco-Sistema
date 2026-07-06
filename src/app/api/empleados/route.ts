import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Empleado } from "@/components/empleados/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await query<Empleado>(
    "SELECT * FROM empleados ORDER BY created_at DESC"
  );
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

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
    `INSERT INTO empleados (
       nombre, puesto, area, foto_url, email_trabajo, telefono_trabajo,
       jefe_directo, dni, dni_foto_url, monto_pago
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
    ]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}
