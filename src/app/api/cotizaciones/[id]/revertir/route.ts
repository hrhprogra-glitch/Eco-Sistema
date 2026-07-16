import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import type { LineaItem } from "@/components/ui/LineaItemsEditor";

// Revertir una venta confirmada: devuelve el stock descontado y regresa el estado a
// "aceptada" (quedó aceptada por el cliente, pero ya no está confirmada como venta).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const cotizacionRes = await client.query(
      "SELECT estado, lineas_modo, lineas_detalle FROM cotizaciones WHERE id = $1 FOR UPDATE",
      [id]
    );
    if (cotizacionRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
    }
    if (cotizacionRes.rows[0].estado !== "confirmada") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Esta cotización no está confirmada." }, { status: 409 });
    }

    // Las cotizaciones importadas (lineas_modo "libre") son texto libre sin producto_id
    // que rastrear, así que no hay stock que devolver.
    if (cotizacionRes.rows[0].lineas_modo !== "libre") {
      const lineas: LineaItem[] = cotizacionRes.rows[0].lineas_detalle || [];
      for (const linea of lineas) {
        if (linea.tipo !== "producto") continue;
        for (const p of linea.productos) {
          if (p.producto_id) {
            await client.query("UPDATE productos SET stock = stock + $1 WHERE id = $2", [p.cantidad, p.producto_id]);
          }
        }
      }
    }

    await client.query("UPDATE cotizaciones SET estado = 'aceptada' WHERE id = $1", [id]);

    await client.query("COMMIT");
    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al revertir la cotización:", error);
    return NextResponse.json({ error: "No se pudo revertir la venta" }, { status: 500 });
  } finally {
    client.release();
  }
}
