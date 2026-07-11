import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Oportunidad, OportunidadInput } from "@/components/crm/types";

const SELECT_QUERY = `
  SELECT o.id, o.titulo, o.contacto_id, c.nombre AS "contacto_nombre",
         o.etapa, o.monto_estimado, o.notas, o.created_at
  FROM oportunidades o
  JOIN contactos c ON c.id = o.contacto_id
`;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { titulo, contacto_id, etapa, monto_estimado, notas } = body as OportunidadInput;

  const updated = await query(
    `UPDATE oportunidades SET
       titulo = $1, contacto_id = $2, etapa = $3, monto_estimado = $4, notas = $5
     WHERE id = $6`,
    [titulo, contacto_id, etapa, monto_estimado, notas, id]
  );

  if (updated.rowCount === 0) {
    return NextResponse.json({ error: "Oportunidad no encontrada" }, { status: 404 });
  }

  const result = await query<Oportunidad>(`${SELECT_QUERY} WHERE o.id = $1`, [id]);
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const result = await query("DELETE FROM oportunidades WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Oportunidad no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
