import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Piscina, PiscinaInput } from "@/components/piscina/types";

const SELECT_QUERY = `
  SELECT p.id, p.contacto_id, c.nombre AS "contacto_nombre", p.nombre, p.ubicacion,
         p.estado, p.notas, p.frecuencia, p.precio_mantenimiento, p.created_at
  FROM piscinas p
  JOIN contactos c ON c.id = p.contacto_id
`;

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
  const { contacto_id, nombre, ubicacion, estado, notas, frecuencia, precio_mantenimiento } =
    body as PiscinaInput;

  const updated = await query(
    `UPDATE piscinas SET
       contacto_id = $1, nombre = $2, ubicacion = $3, estado = $4,
       notas = $5, frecuencia = $6, precio_mantenimiento = $7
     WHERE id = $8`,
    [contacto_id, nombre, ubicacion, estado, notas, frecuencia, precio_mantenimiento, id]
  );

  if (updated.rowCount === 0) {
    return NextResponse.json({ error: "Piscina no encontrada" }, { status: 404 });
  }

  const result = await query<Piscina>(`${SELECT_QUERY} WHERE p.id = $1`, [id]);
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
  const result = await query("DELETE FROM piscinas WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Piscina no encontrada" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
