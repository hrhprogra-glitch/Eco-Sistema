import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

// Existencia actual por producto y almacén, agregada desde los lotes vigentes. Si un
// producto rastreado todavía no tiene ningún lote (nunca se le confirmó una entrada), no
// aparece acá -- son cosas distintas: "no tengo stock" vs "nunca ingresó por este sistema".
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const productoId = new URL(request.url).searchParams.get("producto_id");

  if (productoId) {
    // Detalle de lotes de un producto puntual, para expandir su fila en la tabla de Stock.
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

  const result = await query(
    `SELECT
       pr.id as producto_id, pr.nombre as producto_nombre, pr.sku, pr.unidad,
       l.almacen_id, al.nombre as almacen_nombre,
       SUM(l.cantidad_actual) as cantidad
     FROM lotes l
     JOIN productos pr ON l.producto_id = pr.id
     JOIN almacenes al ON l.almacen_id = al.id
     WHERE l.cantidad_actual > 0
     GROUP BY pr.id, pr.nombre, pr.sku, pr.unidad, l.almacen_id, al.nombre
     ORDER BY pr.nombre ASC`
  );

  return NextResponse.json(result.rows);
}
