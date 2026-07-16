import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";

// Confirmar una entrada = recibir la mercadería de verdad: por cada línea crea un lote
// nuevo (cada entrada es un lote propio, así "salidas de lotes" puede rastrear de qué
// remito/factura vino cada uno), deja constancia en movimientos_stock (el "cuaderno") y
// suma productos.stock -- mismo criterio que ya usa la confirmación de cotizaciones. Todo
// en una transacción: o se genera todo (lote + movimiento + stock + estado) o no se
// genera nada.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const entradaRes = await client.query("SELECT estado, fecha FROM entradas WHERE id = $1 FOR UPDATE", [id]);
    if (entradaRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Entrada no encontrada" }, { status: 404 });
    }
    if (entradaRes.rows[0].estado !== "borrador") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Esta entrada ya fue confirmada o está cancelada." }, { status: 409 });
    }

    const lineasRes = await client.query("SELECT * FROM entrada_lineas WHERE entrada_id = $1", [id]);
    if (lineasRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "La entrada no tiene líneas para recibir." }, { status: 400 });
    }

    for (const linea of lineasRes.rows) {
      const loteRes = await client.query(
        `INSERT INTO lotes (producto_id, almacen_id, cantidad_inicial, cantidad_actual, costo_unitario, fecha_vencimiento)
         VALUES ($1, $2, $3, $3, $4, $5) RETURNING id`,
        [linea.producto_id, linea.almacen_id, linea.cantidad, linea.costo_unitario, linea.fecha_vencimiento]
      );
      const loteId = loteRes.rows[0].id;

      await client.query(
        `INSERT INTO movimientos_stock (producto_id, almacen_id, lote_id, tipo, cantidad, motivo, entrada_id, fecha)
         VALUES ($1, $2, $3, 'entrada', $4, $5, $6, $7)`,
        [linea.producto_id, linea.almacen_id, loteId, linea.cantidad, `Entrada #${id.slice(0, 8)}`, id, entradaRes.rows[0].fecha]
      );

      await client.query("UPDATE productos SET stock = stock + $1 WHERE id = $2", [linea.cantidad, linea.producto_id]);
    }

    await client.query("UPDATE entradas SET estado = 'confirmada' WHERE id = $1", [id]);

    await client.query("COMMIT");
    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al confirmar la entrada:", error);
    return NextResponse.json({ error: "No se pudo confirmar la entrada" }, { status: 500 });
  } finally {
    client.release();
  }
}
