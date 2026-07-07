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
  const { monto, periodo_inicio, periodo_fin, pagado, fecha_pago, notas } =
    body as PiscinaPagoInput;

  const updated = await query(
    `UPDATE piscina_pagos SET
       monto = $1, periodo_inicio = $2, periodo_fin = $3, pagado = $4, fecha_pago = $5, notas = $6
     WHERE id = $7`,
    [monto, periodo_inicio, periodo_fin, pagado ?? false, fecha_pago, notas ?? "", id]
  );

  if (updated.rowCount === 0) {
    return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
  }

  const result = await query<PiscinaPago>(`${SELECT_QUERY} WHERE pp.id = $1`, [id]);
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
  const result = await query("DELETE FROM piscina_pagos WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
