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

type LoteRow = {
  id: string;
  producto_id: string;
  almacen_id: string;
  cantidad_actual: number;
  fecha_vencimiento: string | null;
  created_at: string;
};

// Registra una salida "carrito": una o más líneas (producto + cantidad), resolviendo el
// lote de cada una automáticamente por FIFO (más antiguo primero), repartiendo entre
// varios lotes si hace falta. Todo el carrito se confirma en una sola transacción -- se
// bloquean de una sola vez todos los lotes involucrados (ORDER BY id, para que dos
// confirmaciones simultáneas siempre pidan los bloqueos en el mismo orden y no generen
// un deadlock) antes de tocar ninguno.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { lineas, fecha, motivo, cliente, trabajador } = body as {
    lineas?: { producto_id: string; cantidad: number }[];
    fecha?: string;
    motivo?: string;
    cliente?: string;
    trabajador?: string;
  };

  if (!Array.isArray(lineas) || lineas.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }
  for (const linea of lineas) {
    if (!linea.producto_id || !linea.cantidad || linea.cantidad <= 0) {
      return NextResponse.json(
        { error: "Cada línea necesita un producto y una cantidad mayor a 0." },
        { status: 400 }
      );
    }
  }

  const MOTIVO_POS = motivo ? motivo : "Salida rápida (POS)";
  const clienteFinal = cliente?.trim() || null;
  const trabajadorFinal = trabajador?.trim() || null;
  const fechaFinal = fecha || new Date().toISOString().split("T")[0];

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const productoIds = [...new Set(lineas.map((l) => l.producto_id))];
    const lotesRes = await client.query<LoteRow>(
      `SELECT * FROM lotes
       WHERE producto_id = ANY($1::uuid[]) AND cantidad_actual > 0
       ORDER BY id ASC
       FOR UPDATE`,
      [productoIds]
    );

    const lotesPorProducto = new Map<string, LoteRow[]>();
    for (const lote of lotesRes.rows) {
      const arr = lotesPorProducto.get(lote.producto_id) ?? [];
      arr.push(lote);
      lotesPorProducto.set(lote.producto_id, arr);
    }
    for (const arr of lotesPorProducto.values()) {
      arr.sort((a, b) => {
        const av = a.fecha_vencimiento ?? "9999-12-31";
        const bv = b.fecha_vencimiento ?? "9999-12-31";
        if (av !== bv) return av < bv ? -1 : 1;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
    }

    const movimientosCreados = [];

    for (const linea of lineas) {
      let restante = Number(linea.cantidad);
      const lotesDisponibles = lotesPorProducto.get(linea.producto_id) ?? [];
      const totalDisponible = lotesDisponibles.reduce((s, l) => s + Number(l.cantidad_actual), 0);

      if (totalDisponible < restante) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: `Stock insuficiente (disponible: ${totalDisponible}, pedido: ${restante}).` },
          { status: 409 }
        );
      }

      for (const lote of lotesDisponibles) {
        if (restante <= 0) break;
        const consumir = Math.min(restante, Number(lote.cantidad_actual));
        if (consumir <= 0) continue;

        await client.query("UPDATE lotes SET cantidad_actual = cantidad_actual - $1 WHERE id = $2", [
          consumir,
          lote.id,
        ]);
        lote.cantidad_actual = Number(lote.cantidad_actual) - consumir;

        const movRes = await client.query(
          `INSERT INTO movimientos_stock (producto_id, almacen_id, lote_id, tipo, cantidad, motivo, cliente, trabajador, fecha)
           VALUES ($1, $2, $3, 'salida', $4, $5, $6, $7, $8) RETURNING *`,
          [linea.producto_id, lote.almacen_id, lote.id, consumir, MOTIVO_POS, clienteFinal, trabajadorFinal, fechaFinal]
        );
        movimientosCreados.push(movRes.rows[0]);
        restante -= consumir;
      }

      await client.query("UPDATE productos SET stock = stock - $1 WHERE id = $2", [
        Number(linea.cantidad),
        linea.producto_id,
      ]);
    }

    await client.query("COMMIT");
    return NextResponse.json({ movimientos: movimientosCreados }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al registrar la salida:", error);
    return NextResponse.json({ error: "No se pudo registrar la salida" }, { status: 500 });
  } finally {
    client.release();
  }
}
