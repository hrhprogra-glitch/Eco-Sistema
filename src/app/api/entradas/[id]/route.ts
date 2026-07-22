import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool, query } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const result = await query(
    `SELECT e.*, p.nombre as proveedor_nombre FROM entradas e
     LEFT JOIN proveedores p ON e.proveedor_id = p.id
     WHERE e.id = $1`,
    [id]
  );
  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Entrada no encontrada" }, { status: 404 });
  }

  const lineas = await query(
    `SELECT
      el.*,
      pr.nombre as producto_nombre,
      COALESCE(SUM(ncl.cantidad), 0) as cantidad_devuelta
     FROM entrada_lineas el
     LEFT JOIN productos pr ON el.producto_id = pr.id
     LEFT JOIN notas_credito_lineas ncl ON el.id = ncl.entrada_linea_id
     WHERE el.entrada_id = $1
     GROUP BY el.id, pr.nombre`,
    [id]
  );

  // Calcular cantidad disponible para devolver
  const lineasConDisponible = lineas.rows.map((l: any) => ({
    ...l,
    cantidad_disponible: Number(l.cantidad) - Number(l.cantidad_devuelta),
  }));

  return NextResponse.json({ ...result.rows[0], lineas: lineasConDisponible });
}

// Solo se puede editar mientras está en "borrador" -- una vez confirmada, ya generó
// lotes y movimientos, así que editarla retroactivamente rompería esa contabilidad.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { proveedor_id, numero_factura_proveedor, fecha, notas, lineas, moneda, factura_pdf_url } = body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const actual = await client.query("SELECT estado FROM entradas WHERE id = $1 FOR UPDATE", [id]);
    if (actual.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Entrada no encontrada" }, { status: 404 });
    }
    if (actual.rows[0].estado !== "borrador") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Solo se puede editar una entrada en borrador." }, { status: 409 });
    }

    const updateFields: string[] = [];
    const values: unknown[] = [];

    if (proveedor_id !== undefined) {
      updateFields.push(`proveedor_id = $${updateFields.length + 1}`);
      values.push(proveedor_id);
    }
    if (numero_factura_proveedor !== undefined) {
      updateFields.push(`numero_factura_proveedor = $${updateFields.length + 1}`);
      values.push(numero_factura_proveedor);
    }
    if (fecha !== undefined) {
      updateFields.push(`fecha = $${updateFields.length + 1}`);
      values.push(fecha);
    }
    if (notas !== undefined) {
      updateFields.push(`notas = $${updateFields.length + 1}`);
      values.push(notas);
    }
    if (moneda !== undefined) {
      updateFields.push(`moneda = $${updateFields.length + 1}`);
      values.push(moneda === "USD" ? "USD" : "PEN");
    }
    if (factura_pdf_url !== undefined) {
      updateFields.push(`factura_pdf_url = $${updateFields.length + 1}`);
      values.push(factura_pdf_url);
    }

    let lineasFinales = null;
    if (lineas !== undefined) {
      await client.query("DELETE FROM entrada_lineas WHERE entrada_id = $1", [id]);
      for (const linea of lineas) {
        await client.query(
          `INSERT INTO entrada_lineas (entrada_id, producto_id, almacen_id, cantidad, costo_unitario, subtotal, fecha_vencimiento)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id, linea.producto_id, linea.almacen_id, linea.cantidad, linea.costo_unitario, linea.subtotal, linea.fecha_vencimiento || null]
        );
      }
      lineasFinales = lineas;
      const total = lineas.reduce((acc: number, l: { subtotal: number }) => acc + Number(l.subtotal), 0);
      updateFields.push(`total = $${updateFields.length + 1}`);
      values.push(total);
    }

    if (updateFields.length > 0) {
      const queryStr = `UPDATE entradas SET ${updateFields.join(", ")} WHERE id = $${updateFields.length + 1}`;
      values.push(id);
      await client.query(queryStr, values);
    }

    await client.query("COMMIT");
    return NextResponse.json({ success: true, lineas: lineasFinales });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating entrada:", error);
    return NextResponse.json({ error: "Error al actualizar la entrada" }, { status: 500 });
  } finally {
    client.release();
  }
}

// Se puede borrar en dos casos: "borrador" (nunca tocó stock) o "devuelta" (ya se
// revirtió el 100% del stock vía nota de crédito, así que no queda ningún efecto de
// inventario pendiente). Una entrada "confirmada" con stock activo NO se puede borrar
// directamente -- primero hay que devolverla (ver /api/notas-credito) para no perder
// el rastro de qué pasó con ese stock.
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query("SELECT estado FROM entradas WHERE id = $1 FOR UPDATE", [id]);
    if (existing.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Entrada no encontrada" }, { status: 404 });
    }

    const estado = existing.rows[0].estado;
    if (estado !== "borrador" && estado !== "devuelta") {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Solo se puede borrar una entrada en borrador, o una ya devuelta por completo." },
        { status: 409 }
      );
    }

    if (estado === "devuelta") {
      // Borrar primero las notas de crédito y movimientos asociados -- tienen
      // ON DELETE NO ACTION hacia entradas, así que bloquearían el DELETE si quedan.
      await client.query(
        `DELETE FROM notas_credito_lineas WHERE nota_credito_id IN (
           SELECT id FROM notas_credito WHERE entrada_id = $1
         )`,
        [id]
      );
      await client.query("DELETE FROM notas_credito WHERE entrada_id = $1", [id]);
      await client.query("DELETE FROM movimientos_stock WHERE entrada_id = $1", [id]);
    }

    // entrada_lineas se borra en cascada automáticamente.
    await client.query("DELETE FROM entradas WHERE id = $1", [id]);

    await client.query("COMMIT");
    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting entrada:", error);
    return NextResponse.json({ error: "Error al borrar la entrada" }, { status: 500 });
  } finally {
    client.release();
  }
}
