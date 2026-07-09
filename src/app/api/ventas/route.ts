import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool, query } from "@/lib/db";
import type { Venta, VentaLinea } from "@/components/ventas/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Fetch sales and join with contactos table if it exists? Wait, the contact is probably from 'directorio' or similar. 
  // Let's assume contacts are from `contactos` table (we saw it in piscina).
  const result = await query(
    `SELECT v.*, c.nombre as contacto_nombre 
     FROM ventas v
     LEFT JOIN contactos c ON v.contacto_id = c.id
     ORDER BY v.created_at DESC`
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

    const ventaRes = await client.query(
      `INSERT INTO ventas (contacto_id, estado, total, fecha, notas)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [contacto_id, estado || "borrador", total, fecha || new Date().toISOString().split("T")[0], notas]
    );
    const ventaId = ventaRes.rows[0].id;

    if (lineas && lineas.length > 0) {
      for (const linea of lineas) {
        await client.query(
          `INSERT INTO venta_lineas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [ventaId, linea.producto_id, linea.cantidad, linea.precio_unitario, linea.subtotal]
        );
      }
    }

    await client.query("COMMIT");
    return NextResponse.json(ventaRes.rows[0], { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating venta:", error);
    return NextResponse.json({ error: "Error al crear la venta" }, { status: 500 });
  } finally {
    client.release();
  }
}
