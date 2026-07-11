import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool, query } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await query(
    `SELECT p.*, ct.nombre as contacto_nombre
     FROM pedidos p
     LEFT JOIN contactos ct ON p.contacto_id = ct.id
     ORDER BY p.created_at DESC`
  );

  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { contacto_id, estado, total, fecha, notas, lineas } = body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const pedidoRes = await client.query(
      `INSERT INTO pedidos (contacto_id, estado, total, fecha, notas)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [contacto_id, estado || "pendiente", total, fecha || new Date().toISOString().split("T")[0], notas]
    );
    const pedidoId = pedidoRes.rows[0].id;

    if (lineas && lineas.length > 0) {
      for (const linea of lineas) {
        await client.query(
          `INSERT INTO pedido_lineas (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [pedidoId, linea.producto_id, linea.cantidad, linea.precio_unitario, linea.subtotal]
        );
      }
    }

    await client.query("COMMIT");
    return NextResponse.json(pedidoRes.rows[0], { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating pedido:", error);
    return NextResponse.json({ error: "Error al crear el pedido" }, { status: 500 });
  } finally {
    client.release();
  }
}
