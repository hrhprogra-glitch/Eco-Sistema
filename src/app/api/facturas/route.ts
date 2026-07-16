import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool, query } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await query(
    `SELECT f.*, ct.nombre as contacto_nombre
     FROM facturas f
     LEFT JOIN contactos ct ON f.contacto_id = ct.id
     ORDER BY f.created_at DESC`
  );

  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { contacto_id, cotizacion_id, estado, total, fecha, notas, lineas } = body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const facturaRes = await client.query(
      `INSERT INTO facturas (contacto_id, cotizacion_id, estado, total, fecha, notas)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [contacto_id, cotizacion_id || null, estado || "borrador", total, fecha || new Date().toISOString().split("T")[0], notas]
    );
    const facturaId = facturaRes.rows[0].id;

    if (lineas && lineas.length > 0) {
      for (const linea of lineas) {
        await client.query(
          `INSERT INTO factura_lineas (factura_id, producto_id, descripcion, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [facturaId, linea.producto_id || null, linea.descripcion || null, linea.cantidad, linea.precio_unitario, linea.subtotal]
        );
      }
    }

    await client.query("COMMIT");
    return NextResponse.json(facturaRes.rows[0], { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating factura:", error);
    return NextResponse.json({ error: "Error al crear la factura" }, { status: 500 });
  } finally {
    client.release();
  }
}
