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

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await query<Oportunidad>(`${SELECT_QUERY} ORDER BY o.created_at DESC`);
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { titulo, contacto_id, etapa, monto_estimado, notas } = body as OportunidadInput;

  const inserted = await query<{ id: string }>(
    `INSERT INTO oportunidades (titulo, contacto_id, etapa, monto_estimado, notas)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [titulo, contacto_id, etapa || "nuevo", monto_estimado || 0, notas || ""]
  );

  const result = await query<Oportunidad>(`${SELECT_QUERY} WHERE o.id = $1`, [inserted.rows[0].id]);
  return NextResponse.json(result.rows[0], { status: 201 });
}
