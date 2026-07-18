import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "ID de movimiento requerido" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { cantidad, motivo } = body;

    if (!cantidad || cantidad <= 0) {
      return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Obtener el movimiento actual
      const movRes = await client.query(
        "SELECT * FROM movimientos_stock WHERE id = $1 FOR UPDATE",
        [id]
      );
      if (movRes.rowCount === 0) {
        throw new Error("Movimiento no encontrado");
      }
      const mov = movRes.rows[0];

      if (mov.tipo !== "salida") {
        throw new Error("Solo se pueden editar movimientos de tipo salida desde esta interfaz");
      }

      const oldCantidad = parseFloat(mov.cantidad);
      const newCantidad = parseFloat(cantidad);
      const delta = newCantidad - oldCantidad;

      // 2. Si la cantidad cambió, actualizar stock del producto y del lote
      if (delta !== 0) {
        // Bloquear producto
        await client.query("SELECT id FROM productos WHERE id = $1 FOR UPDATE", [mov.producto_id]);
        
        // El delta indica cuánto MÁS salió. 
        // Si antes salió 5 (oldCantidad) y ahora 7 (newCantidad), delta = +2. 
        // Significa que hay que restar 2 más del stock.
        // Si antes salió 5 y ahora 3, delta = -2. Hay que restar -2 (es decir, sumar 2) al stock.
        await client.query(
          "UPDATE productos SET stock = stock - $1, updated_at = now() WHERE id = $2",
          [delta, mov.producto_id]
        );

        if (mov.lote_id) {
          // Bloquear y actualizar lote
          await client.query("SELECT id FROM lotes WHERE id = $1 FOR UPDATE", [mov.lote_id]);
          const loteUpdate = await client.query(
            "UPDATE lotes SET cantidad_actual = cantidad_actual - $1, updated_at = now() WHERE id = $2 RETURNING cantidad_actual",
            [delta, mov.lote_id]
          );

          // Comprobar que no baje de 0
          if (loteUpdate.rows[0].cantidad_actual < 0) {
            throw new Error("La edición de esta salida resultaría en un stock de lote negativo.");
          }
        }
      }

      // 3. Actualizar el movimiento en sí (cantidad y motivo)
      await client.query(
        "UPDATE movimientos_stock SET cantidad = $1, motivo = $2 WHERE id = $3",
        [newCantidad, motivo || mov.motivo, id]
      );

      await client.query("COMMIT");
      return NextResponse.json({ success: true });
    } catch (err: any) {
      await client.query("ROLLBACK");
      console.error("Error en transacción de edición:", err);
      return NextResponse.json({ error: err.message || "Error al actualizar salida" }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
