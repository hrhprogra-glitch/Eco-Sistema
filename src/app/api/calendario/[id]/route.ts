import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool, query } from "@/lib/db";
import type { EventoCalendario, EventoCalendarioInput } from "@/components/calendario/types";

const SELECT_QUERY = `
  SELECT c.id, c.titulo, c.fecha, c.descripcion, c.estado, c.tipo,
         c.proyecto_id, pr.nombre AS "proyecto_nombre",
         c.piscina_id, pi.nombre AS "piscina_nombre", co.nombre AS "contacto_nombre",
         c.created_at,
         COALESCE(
           (SELECT json_agg(json_build_object('id', e.id, 'nombre', e.nombre) ORDER BY e.nombre)
            FROM calendario_evento_empleados ce
            JOIN empleados e ON e.id = ce.empleado_id
            WHERE ce.evento_id = c.id),
           '[]'
         ) AS empleados
  FROM calendario_eventos c
  LEFT JOIN proyectos pr ON pr.id = c.proyecto_id
  LEFT JOIN piscinas pi ON pi.id = c.piscina_id
  LEFT JOIN contactos co ON co.id = pi.contacto_id
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
  const { titulo, fecha, descripcion, estado, proyecto_id, piscina_id, tipo, empleado_ids } =
    body as EventoCalendarioInput;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updated = await client.query(
      `UPDATE calendario_eventos SET
         titulo = $1, fecha = $2, descripcion = $3, estado = $4, proyecto_id = $5, piscina_id = $6, tipo = $7
       WHERE id = $8`,
      [titulo, fecha, descripcion, estado, proyecto_id, piscina_id, tipo || "nota", id]
    );

    if (updated.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    await client.query(`DELETE FROM calendario_evento_empleados WHERE evento_id = $1`, [id]);
    for (const empleadoId of empleado_ids ?? []) {
      await client.query(
        `INSERT INTO calendario_evento_empleados (evento_id, empleado_id) VALUES ($1, $2)`,
        [id, empleadoId]
      );
    }

    await client.query("COMMIT");

    const result = await query<EventoCalendario>(`${SELECT_QUERY} WHERE c.id = $1`, [id]);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating evento:", error);
    return NextResponse.json({ error: "Error al actualizar el evento" }, { status: 500 });
  } finally {
    client.release();
  }
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
  const result = await query("DELETE FROM calendario_eventos WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
