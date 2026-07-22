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

  // Sin trim, "ACME S.A.C." y "ACME S.A.C. " (con un espacio de más al final, típico
  // de copiar/pegar o de un PDF importado) son strings distintos para Postgres y
  // terminan generando "duplicados" que en pantalla se ven idénticos.
  const nombreLimpio = nombre?.trim();
  const rucLimpio = ruc?.trim() || null;

  // Si ya existe un proveedor con ese mismo RUC, se actualiza el nombre en vez de
  // insertar uno nuevo -- esto es lo que de verdad cierra la puerta a duplicados por
  // RUC (el índice único en la base es la garantía; este UPSERT evita que dos
  // pestañas/importaciones simultáneas choquen con un error en vez de converger al
  // mismo registro).
  const result = await query<Proveedor>(
    `INSERT INTO proveedores (nombre, ruc, contacto, telefono, email, notas)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (ruc) WHERE ruc IS NOT NULL
     DO UPDATE SET nombre = EXCLUDED.nombre
     RETURNING *`,
    [nombreLimpio, rucLimpio, contacto?.trim() || null, telefono?.trim() || null, email?.trim() || null, notas?.trim() || null]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}
