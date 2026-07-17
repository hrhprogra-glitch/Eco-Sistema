import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool, query } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await query(
    `SELECT e.*, p.nombre as proveedor_nombre
     FROM entradas e
     LEFT JOIN proveedores p ON e.proveedor_id = p.id
     ORDER BY e.created_at DESC`
  );

  return NextResponse.json(result.rows);
}

// Crea la entrada como "borrador", con sus líneas -- todavía no toca stock ni lotes,
// eso recién pasa al confirmarla (ver [id]/confirmar/route.ts).
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { proveedor_id, numero_factura_proveedor, fecha, notas, lineas, moneda } = body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const total = (lineas || []).reduce((acc: number, l: { subtotal: number }) => acc + Number(l.subtotal), 0);

    const entradaRes = await client.query(
      `INSERT INTO entradas (proveedor_id, numero_factura_proveedor, total, fecha, notas, moneda)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [proveedor_id, numero_factura_proveedor || null, total, fecha || new Date().toISOString().split("T")[0], notas || null, moneda === "USD" ? "USD" : "PEN"]
    );
    const entradaId = entradaRes.rows[0].id;

    if (lineas && lineas.length > 0) {
      for (const linea of lineas) {
        await client.query(
          `INSERT INTO entrada_lineas (entrada_id, producto_id, almacen_id, cantidad, costo_unitario, subtotal, fecha_vencimiento)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [entradaId, linea.producto_id, linea.almacen_id, linea.cantidad, linea.costo_unitario, linea.subtotal, linea.fecha_vencimiento || null]
        );
      }
    }

    await client.query("COMMIT");
    return NextResponse.json(entradaRes.rows[0], { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating entrada:", error);
    return NextResponse.json({ error: "Error al crear la entrada" }, { status: 500 });
  } finally {
    client.release();
  }
}
