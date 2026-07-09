import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { PiscinaPago, PiscinaPagoInput } from "@/components/piscina/types";

const SELECT_QUERY = `
  SELECT pp.id, pp.piscina_id, pi.nombre AS "piscina_nombre", co.nombre AS "contacto_nombre",
         pp.monto, pp.periodo_inicio, pp.periodo_fin, pp.pagado, pp.fecha_pago,
         pp.notas, pp.created_at
  FROM piscina_pagos pp
  JOIN piscinas pi ON pi.id = pp.piscina_id
  JOIN contactos co ON co.id = pi.contacto_id
`;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await query<PiscinaPago>(`${SELECT_QUERY} ORDER BY pp.periodo_fin DESC`);
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { piscina_id, monto, periodo_inicio, periodo_fin, pagado, fecha_pago, notas } =
    body as PiscinaPagoInput;

  const inserted = await query<{ id: number }>(
    `INSERT INTO piscina_pagos (piscina_id, monto, periodo_inicio, periodo_fin, pagado, fecha_pago, notas)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [piscina_id, monto, periodo_inicio, periodo_fin, pagado ?? false, fecha_pago, notas ?? ""]
  );

  const result = await query<PiscinaPago>(`${SELECT_QUERY} WHERE pp.id = $1`, [
    inserted.rows[0].id,
  ]);

  return NextResponse.json(result.rows[0], { status: 201 });
}
