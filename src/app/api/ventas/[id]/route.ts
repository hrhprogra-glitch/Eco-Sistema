import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool, query } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  const { id } = await params;
  const result = await query("SELECT * FROM ventas WHERE id = $1", [id]);
  if (result.rows.length === 0) return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });

  const lineas = await query("SELECT * FROM venta_lineas WHERE venta_id = $1", [id]);

  return NextResponse.json({ ...result.rows[0], lineas: lineas.rows });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  
  const { id } = await params;
  const body = await request.json();
  const { contacto_id, estado, total, fecha, notas, lineas } = body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updateFields = [];
    const values = [];
    let queryStr = "UPDATE ventas SET ";

    if (contacto_id !== undefined) {
      updateFields.push(`contacto_id = $${updateFields.length + 1}`);
      values.push(contacto_id);
    }
    if (estado !== undefined) {
      updateFields.push(`estado = $${updateFields.length + 1}`);
      values.push(estado);
    }
    if (total !== undefined) {
      updateFields.push(`total = $${updateFields.length + 1}`);
      values.push(total);
    }
    if (fecha !== undefined) {
      updateFields.push(`fecha = $${updateFields.length + 1}`);
      values.push(fecha);
    }
    if (notas !== undefined) {
      updateFields.push(`notas = $${updateFields.length + 1}`);
      values.push(notas);
    }

    if (updateFields.length > 0) {
      queryStr += updateFields.join(", ") + ` WHERE id = $${updateFields.length + 1} RETURNING *`;
      values.push(id);
      await client.query(queryStr, values);
    }

    // Update lines: Simple approach is to delete and recreate. 
    // This is often easier for complex forms unless ids need preserving.
    if (lineas !== undefined) {
      await client.query("DELETE FROM venta_lineas WHERE venta_id = $1", [id]);
      
      for (const linea of lineas) {
        await client.query(
          `INSERT INTO venta_lineas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, linea.producto_id, linea.cantidad, linea.precio_unitario, linea.subtotal]
        );
      }
    }

    await client.query("COMMIT");
    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating venta:", error);
    return NextResponse.json({ error: "Error al actualizar la venta" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await query("DELETE FROM ventas WHERE id = $1", [id]);
  return NextResponse.json({ success: true });
}
