import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool, query } from "@/lib/db";

// Lotes disponibles (cantidad_actual > 0) de un producto, para elegir de cuál sale la
// mercadería al armar una Salida. Ordenados por vencimiento/antigüedad primero (FIFO).
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const productoId = new URL(request.url).searchParams.get("producto_id");
  if (!productoId) {
    return NextResponse.json({ error: "Falta producto_id" }, { status: 400 });
  }

  const result = await query(
    `SELECT l.*, a.nombre as almacen_nombre
     FROM lotes l
     LEFT JOIN almacenes a ON l.almacen_id = a.id
     WHERE l.producto_id = $1 AND l.cantidad_actual > 0
     ORDER BY l.fecha_vencimiento ASC NULLS LAST, l.created_at ASC`,
    [productoId]
  );

  return NextResponse.json(result.rows);
}

// Registra una salida: descuenta del lote elegido, descuenta productos.stock y deja
// constancia en el cuaderno -- todo en una transacción, con el lote bloqueado (FOR UPDATE)
// para no permitir dos salidas simultáneas que dejen la cantidad en negativo.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { lote_id, cantidad, motivo, fecha } = body;

  if (!lote_id || !cantidad || cantidad <= 0 || !motivo) {
    return NextResponse.json({ error: "Faltan datos: lote, cantidad y motivo son obligatorios." }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const loteRes = await client.query("SELECT * FROM lotes WHERE id = $1 FOR UPDATE", [lote_id]);
    if (loteRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Lote no encontrado" }, { status: 404 });
    }
    const lote = loteRes.rows[0];
    if (Number(lote.cantidad_actual) < Number(cantidad)) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: `El lote solo tiene ${lote.cantidad_actual} disponibles.` },
        { status: 409 }
      );
    }

    await client.query("UPDATE lotes SET cantidad_actual = cantidad_actual - $1 WHERE id = $2", [cantidad, lote_id]);
    await client.query("UPDATE productos SET stock = stock - $1 WHERE id = $2", [cantidad, lote.producto_id]);

    const movRes = await client.query(
      `INSERT INTO movimientos_stock (producto_id, almacen_id, lote_id, tipo, cantidad, motivo, fecha)
       VALUES ($1, $2, $3, 'salida', $4, $5, $6) RETURNING *`,
      [lote.producto_id, lote.almacen_id, lote_id, cantidad, motivo, fecha || new Date().toISOString().split("T")[0]]
    );

    await client.query("COMMIT");
    return NextResponse.json(movRes.rows[0], { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al registrar la salida:", error);
    return NextResponse.json({ error: "No se pudo registrar la salida" }, { status: 500 });
  } finally {
    client.release();
  }
}
