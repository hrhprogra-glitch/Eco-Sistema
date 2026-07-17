import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";

// Registra un ajuste de inventario físico: el usuario cuenta lo que tiene de verdad
// (producto + almacén) y este endpoint reconcilia el sistema contra ese conteo.
//   diferencia = cantidad_fisica - cantidad_en_sistema (suma de lotes.cantidad_actual)
// Si es positiva, crea un lote nuevo (mismo criterio que confirmar una entrada, con el
// último costo unitario conocido de ese producto). Si es negativa, descuenta de los lotes
// existentes más antiguos primero (mismo criterio FIFO que una salida), sin poder dejar
// ningún lote en negativo. Todo en una transacción con FOR UPDATE.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { producto_id, almacen_id, cantidad_fisica, motivo, fecha } = body;

  if (!producto_id || !almacen_id || cantidad_fisica === undefined || cantidad_fisica === null || Number(cantidad_fisica) < 0) {
    return NextResponse.json({ error: "Faltan datos: producto, almacén y cantidad física son obligatorios." }, { status: 400 });
  }

  const fechaAjuste = fecha || new Date().toISOString().split("T")[0];
  const motivoAjuste = (motivo && String(motivo).trim()) || "Ajuste de inventario físico";

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const lotesRes = await client.query(
      `SELECT * FROM lotes WHERE producto_id = $1 AND almacen_id = $2 AND cantidad_actual > 0
       ORDER BY fecha_vencimiento ASC NULLS LAST, created_at ASC FOR UPDATE`,
      [producto_id, almacen_id]
    );
    const cantidadSistema = lotesRes.rows.reduce((sum, l) => sum + Number(l.cantidad_actual), 0);
    const cantidadFisica = Number(cantidad_fisica);
    const diferencia = Math.round((cantidadFisica - cantidadSistema) * 100) / 100;

    if (diferencia === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ cantidad_sistema: cantidadSistema, cantidad_fisica: cantidadFisica, diferencia: 0, sinCambios: true });
    }

    let loteId: string | null = null;

    if (diferencia > 0) {
      const ultimoCosto = await client.query(
        `SELECT costo_unitario FROM lotes WHERE producto_id = $1 AND almacen_id = $2 ORDER BY created_at DESC LIMIT 1`,
        [producto_id, almacen_id]
      );
      const costoUnitario = ultimoCosto.rows[0]?.costo_unitario ?? 0;

      const loteRes = await client.query(
        `INSERT INTO lotes (producto_id, almacen_id, cantidad_inicial, cantidad_actual, costo_unitario)
         VALUES ($1, $2, $3, $3, $4) RETURNING id`,
        [producto_id, almacen_id, diferencia, costoUnitario]
      );
      loteId = loteRes.rows[0].id;
    } else {
      let porQuitar = Math.abs(diferencia);
      for (const lote of lotesRes.rows) {
        if (porQuitar <= 0) break;
        const quitarDeEsteLote = Math.min(porQuitar, Number(lote.cantidad_actual));
        await client.query("UPDATE lotes SET cantidad_actual = cantidad_actual - $1 WHERE id = $2", [quitarDeEsteLote, lote.id]);
        porQuitar = Math.round((porQuitar - quitarDeEsteLote) * 100) / 100;
      }
    }

    const movRes = await client.query(
      `INSERT INTO movimientos_stock (producto_id, almacen_id, lote_id, tipo, cantidad, motivo, fecha)
       VALUES ($1, $2, $3, 'ajuste', $4, $5, $6) RETURNING *`,
      [producto_id, almacen_id, loteId, Math.abs(diferencia), `${motivoAjuste} (${diferencia > 0 ? "+" : ""}${diferencia})`, fechaAjuste]
    );

    await client.query("UPDATE productos SET stock = stock + $1 WHERE id = $2", [diferencia, producto_id]);

    await client.query("COMMIT");
    return NextResponse.json({
      ...movRes.rows[0],
      cantidad_sistema: cantidadSistema,
      cantidad_fisica: cantidadFisica,
      diferencia,
    }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al registrar el ajuste:", error);
    return NextResponse.json({ error: "No se pudo registrar el ajuste" }, { status: 500 });
  } finally {
    client.release();
  }
}
