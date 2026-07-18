import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";

// Edita un lote a mano (corregir un dato mal cargado, o ajustar cuánto queda disponible
// sin pasar por un movimiento de salida). Si cambia cantidad_actual, la diferencia se
// refleja en productos.stock y queda su propio movimiento en movimientos_stock -mismo
// criterio que un ajuste de inventario-, todo en una transacción.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { numero_lote, cantidad_inicial, cantidad_actual, costo_unitario, fecha_vencimiento } = body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const actual = await client.query("SELECT * FROM lotes WHERE id = $1 FOR UPDATE", [id]);
    if (actual.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Lote no encontrado" }, { status: 404 });
    }
    const lote = actual.rows[0];

    const updateFields: string[] = [];
    const values: unknown[] = [];

    if (numero_lote !== undefined) {
      updateFields.push(`numero_lote = $${updateFields.length + 1}`);
      values.push(numero_lote || null);
    }
    if (cantidad_inicial !== undefined) {
      updateFields.push(`cantidad_inicial = $${updateFields.length + 1}`);
      values.push(Number(cantidad_inicial));
    }
    if (cantidad_actual !== undefined) {
      updateFields.push(`cantidad_actual = $${updateFields.length + 1}`);
      values.push(Number(cantidad_actual));
    }
    if (costo_unitario !== undefined) {
      updateFields.push(`costo_unitario = $${updateFields.length + 1}`);
      values.push(Number(costo_unitario));
    }
    if (fecha_vencimiento !== undefined) {
      updateFields.push(`fecha_vencimiento = $${updateFields.length + 1}`);
      values.push(fecha_vencimiento || null);
    }

    if (updateFields.length > 0) {
      values.push(id);
      await client.query(`UPDATE lotes SET ${updateFields.join(", ")} WHERE id = $${updateFields.length + 1}`, values);
    }

    if (cantidad_actual !== undefined) {
      const delta = Math.round((Number(cantidad_actual) - Number(lote.cantidad_actual)) * 100) / 100;
      if (delta !== 0) {
        await client.query(
          `INSERT INTO movimientos_stock (producto_id, almacen_id, lote_id, tipo, cantidad, motivo)
           VALUES ($1, $2, $3, 'ajuste', $4, 'Lote editado a mano')`,
          [lote.producto_id, lote.almacen_id, id, Math.abs(delta)]
        );
        await client.query("UPDATE productos SET stock = stock + $1 WHERE id = $2", [delta, lote.producto_id]);
      }
    }

    const result = await client.query("SELECT * FROM lotes WHERE id = $1", [id]);
    await client.query("COMMIT");
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al editar el lote:", error);
    return NextResponse.json({ error: "No se pudo editar el lote" }, { status: 500 });
  } finally {
    client.release();
  }
}

// Elimina un lote a mano. Los movimientos ya registrados contra este lote (la entrada que
// lo generó, ajustes previos) quedan como historial -se desvinculan del lote borrado en vez
// de borrarse ellos también, porque movimientos_stock.lote_id no tiene ON DELETE CASCADE-.
// Si todavía tenía cantidad disponible, se descuenta de productos.stock y queda su propio
// movimiento de ajuste, todo en una transacción.
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const loteRes = await client.query("SELECT * FROM lotes WHERE id = $1 FOR UPDATE", [id]);
    if (loteRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Lote no encontrado" }, { status: 404 });
    }
    const lote = loteRes.rows[0];

    await client.query("UPDATE movimientos_stock SET lote_id = NULL WHERE lote_id = $1", [id]);

    const cantidadActual = Number(lote.cantidad_actual);
    if (cantidadActual !== 0) {
      await client.query(
        `INSERT INTO movimientos_stock (producto_id, almacen_id, lote_id, tipo, cantidad, motivo)
         VALUES ($1, $2, NULL, 'ajuste', $3, 'Lote eliminado a mano')`,
        [lote.producto_id, lote.almacen_id, cantidadActual]
      );
      await client.query("UPDATE productos SET stock = stock - $1 WHERE id = $2", [cantidadActual, lote.producto_id]);
    }

    await client.query("DELETE FROM lotes WHERE id = $1", [id]);

    await client.query("COMMIT");
    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al eliminar el lote:", error);
    return NextResponse.json({ error: "No se pudo eliminar el lote" }, { status: 500 });
  } finally {
    client.release();
  }
}
