import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Piscina, PiscinaInput } from "@/components/piscina/types";

const SELECT_QUERY = `
  SELECT p.id, p.contacto_id, c.nombre AS "contacto_nombre", p.nombre, p.ubicacion,
         p.volumen_m3, p.estado, p.nivel_cloro, p.notas, p.created_at
  FROM piscinas p
  JOIN contactos c ON c.id = p.contacto_id
`;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await query<Piscina>(`${SELECT_QUERY} ORDER BY p.created_at DESC`);
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { contacto_id, nombre, ubicacion, volumen_m3, estado, nivel_cloro, notas } =
    body as PiscinaInput;

  const inserted = await query<{ id: number }>(
    `INSERT INTO piscinas (contacto_id, nombre, ubicacion, volumen_m3, estado, nivel_cloro, notas)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [contacto_id, nombre, ubicacion, volumen_m3, estado, nivel_cloro, notas]
  );

  const result = await query<Piscina>(`${SELECT_QUERY} WHERE p.id = $1`, [
    inserted.rows[0].id,
  ]);

  return NextResponse.json(result.rows[0], { status: 201 });
}
