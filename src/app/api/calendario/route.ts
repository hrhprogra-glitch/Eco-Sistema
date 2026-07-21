import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool, query } from "@/lib/db";
import type { EventoCalendario, EventoCalendarioInput } from "@/components/calendario/types";

const SELECT_QUERY = `
  SELECT c.id, c.titulo, c.fecha, c.descripcion, c.estado, c.tipo,
         c.piscina_id, pi.nombre AS "piscina_nombre", co.nombre AS "contacto_nombre",
         c.created_at
  FROM calendario_eventos c
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
  const { titulo, fecha, descripcion, estado, piscina_id, tipo } = body as EventoCalendarioInput;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const inserted = await client.query<{ id: string }>(
      `INSERT INTO calendario_eventos (titulo, fecha, descripcion, estado, piscina_id, tipo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [titulo, fecha, descripcion, estado ?? "pendiente", piscina_id, tipo || "nota"]
    );
    const eventoId = inserted.rows[0].id;

    await client.query("COMMIT");

    const result = await query<EventoCalendario>(`${SELECT_QUERY} WHERE c.id = $1`, [eventoId]);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating evento:", error);
    return NextResponse.json({ error: "Error al crear el evento" }, { status: 500 });
  } finally {
    client.release();
  }
}
