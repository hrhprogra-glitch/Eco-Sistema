import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { monto, fecha, metodo, notas } = body;

  if (!monto || Number(monto) <= 0) {
    return NextResponse.json({ error: "El monto del pago debe ser mayor a 0." }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const facturaRes = await client.query("SELECT total, estado FROM facturas WHERE id = $1 FOR UPDATE", [id]);
    if (facturaRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
    }

    const pagoRes = await client.query(
      `INSERT INTO factura_pagos (factura_id, monto, fecha, metodo, notas)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, monto, fecha || new Date().toISOString().split("T")[0], metodo || null, notas || null]
    );

    const sumaRes = await client.query(
      "SELECT COALESCE(SUM(monto), 0) as pagado FROM factura_pagos WHERE factura_id = $1",
      [id]
    );
    const pagado = Number(sumaRes.rows[0].pagado);
    const total = Number(facturaRes.rows[0].total);

    if (pagado >= total && facturaRes.rows[0].estado !== "pagada") {
      await client.query("UPDATE facturas SET estado = 'pagada' WHERE id = $1", [id]);
    }

    await client.query("COMMIT");
    return NextResponse.json(pagoRes.rows[0], { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error registrando pago:", error);
    return NextResponse.json({ error: "Error al registrar el pago" }, { status: 500 });
  } finally {
    client.release();
  }
}
