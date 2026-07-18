import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";

// Alta manual de un lote (fuera del flujo de confirmar una compra): para cargar stock
// inicial de un producto o sumar existencias sueltas sin pasar por Compras. Mismo criterio
// que confirmar entrada/ajuste: se registra en movimientos_stock y se refleja en
// productos.stock, todo en una transacción.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { producto_id, almacen_id, numero_lote, cantidad, costo_unitario, fecha_vencimiento } = body;

  if (!producto_id || !almacen_id || cantidad === undefined || cantidad === null || Number(cantidad) <= 0) {
    return NextResponse.json({ error: "Producto, almacén y una cantidad mayor a 0 son obligatorios." }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const cant = Number(cantidad);
    const costo = Number(costo_unitario) || 0;

    const loteRes = await client.query(
      `INSERT INTO lotes (producto_id, almacen_id, numero_lote, cantidad_inicial, cantidad_actual, costo_unitario, fecha_vencimiento)
       VALUES ($1, $2, $3, $4, $4, $5, $6) RETURNING *`,
      [producto_id, almacen_id, numero_lote || null, cant, costo, fecha_vencimiento || null]
    );
    const lote = loteRes.rows[0];

    await client.query(
      `INSERT INTO movimientos_stock (producto_id, almacen_id, lote_id, tipo, cantidad, motivo)
       VALUES ($1, $2, $3, 'ajuste', $4, 'Lote agregado a mano')`,
      [producto_id, almacen_id, lote.id, cant]
    );
    await client.query("UPDATE productos SET stock = stock + $1 WHERE id = $2", [cant, producto_id]);

    await client.query("COMMIT");
    return NextResponse.json(lote, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al crear el lote:", error);
    return NextResponse.json({ error: "No se pudo crear el lote" }, { status: 500 });
  } finally {
    client.release();
  }
}
