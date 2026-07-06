import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { EventoCalendario, EventoCalendarioInput } from "@/components/calendario/types";

const SELECT_QUERY = `
  SELECT c.id, c.titulo, c.fecha, c.descripcion, c.estado,
         c.proyecto_id, pr.nombre AS "proyecto_nombre",
         c.piscina_id, pi.nombre AS "piscina_nombre", co.nombre AS "contacto_nombre",
         c.created_at
  FROM calendario_eventos c
  LEFT JOIN proyectos pr ON pr.id = c.proyecto_id
  LEFT JOIN piscinas pi ON pi.id = c.piscina_id
  LEFT JOIN contactos co ON co.id = pi.contacto_id
`;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await query<EventoCalendario>(`${SELECT_QUERY} ORDER BY c.fecha ASC`);
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { titulo, fecha, descripcion, estado, proyecto_id, piscina_id } =
    body as EventoCalendarioInput;

  const inserted = await query<{ id: number }>(
    `INSERT INTO calendario_eventos (titulo, fecha, descripcion, estado, proyecto_id, piscina_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [titulo, fecha, descripcion, estado ?? "pendiente", proyecto_id, piscina_id]
  );

  const result = await query<EventoCalendario>(`${SELECT_QUERY} WHERE c.id = $1`, [
    inserted.rows[0].id,
  ]);

  return NextResponse.json(result.rows[0], { status: 201 });
}
