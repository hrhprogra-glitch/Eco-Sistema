import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool, query } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { entrada_id, lineas, notas } = body;

  if (!entrada_id || !lineas || lineas.length === 0) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Verificar que la entrada existe y está confirmada
    const entradaResult = await client.query(
      "SELECT id, moneda, numero_factura_proveedor FROM entradas WHERE id = $1 AND estado = 'confirmada'",
      [entrada_id]
    );
    if (entradaResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Entrada no encontrada o no confirmada" }, { status: 404 });
    }

    const entrada = entradaResult.rows[0];

    // Calcular total de la devolución
    const total = lineas.reduce((sum: number, l: any) => sum + Number(l.subtotal), 0);

    // Crear nota de crédito
    const notaCreditoResult = await client.query(
      `INSERT INTO notas_credito (entrada_id, numero_factura_proveedor, fecha, moneda, total, notas)
       VALUES ($1, $2, CURRENT_DATE, $3, $4, $5)
       RETURNING id, fecha, total`,
      [entrada_id, entrada.numero_factura_proveedor, entrada.moneda, total, notas || null]
    );

    const notaCredito = notaCreditoResult.rows[0];

    // Verificar si esta devolución completará toda la compra (para actualizar el estado al final)
    const cantidadOriginalCheck = await client.query(
      "SELECT COALESCE(SUM(cantidad), 0) as total FROM entrada_lineas WHERE entrada_id = $1",
      [entrada_id]
    );
    const cantidadYaDevueltaCheck = await client.query(
      `SELECT COALESCE(SUM(ncl.cantidad), 0) as total FROM notas_credito_lineas ncl
       JOIN notas_credito nc ON ncl.nota_credito_id = nc.id
       WHERE nc.entrada_id = $1`,
      [entrada_id]
    );

    const totalOriginal = Number(cantidadOriginalCheck.rows[0].total);
    const totalYaDevuelto = Number(cantidadYaDevueltaCheck.rows[0].total);
    const totalNuevaDevolucion = lineas.reduce((sum: number, l: any) => sum + Number(l.cantidad), 0);
    const seraDevolucionTotal = (totalYaDevuelto + totalNuevaDevolucion) >= totalOriginal;

    // Devolver al proveedor siempre RESTA del inventario (sea parcial o total) --
    // el producto sale del almacén, sin importar cuánto quede pendiente por devolver.
    for (const linea of lineas) {
      await client.query(
        `INSERT INTO notas_credito_lineas (nota_credito_id, entrada_linea_id, producto_id, almacen_id, cantidad, costo_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [notaCredito.id, linea.entrada_linea_id, linea.producto_id, linea.almacen_id, linea.cantidad, linea.costo_unitario, linea.subtotal]
      );

      await client.query(
        `INSERT INTO movimientos_stock (tipo, producto_id, almacen_id, cantidad, motivo, entrada_id, fecha)
         VALUES ('salida', $1, $2, $3, $4, $5, CURRENT_DATE)`,
        [linea.producto_id, linea.almacen_id, linea.cantidad, `Devolución a proveedor de compra ${entrada_id}`, entrada_id]
      );

      // Descontar de lotes (FIFO: los últimos lotes ingresados primero)
      const lotesResult = await client.query(
        `SELECT id, cantidad_actual FROM lotes
         WHERE producto_id = $1 AND almacen_id = $2 AND cantidad_actual > 0
         ORDER BY created_at DESC`,
        [linea.producto_id, linea.almacen_id]
      );

      let cantidadPorDevolver = Number(linea.cantidad);
      for (const lote of lotesResult.rows) {
        if (cantidadPorDevolver <= 0) break;
        const devolver = Math.min(cantidadPorDevolver, Number(lote.cantidad_actual));
        const nueva_cantidad = Number(lote.cantidad_actual) - devolver;

        await client.query(
          "UPDATE lotes SET cantidad_actual = $1 WHERE id = $2",
          [nueva_cantidad, lote.id]
        );
        cantidadPorDevolver -= devolver;
      }

      // Sincronizar el stock cacheado en productos (mismo criterio que confirmar entrada/salida)
      await client.query(
        "UPDATE productos SET stock = stock - $1 WHERE id = $2",
        [linea.cantidad, linea.producto_id]
      );
    }

    // Si se devolvió todo, cambiar estado a "devuelta"
    if (seraDevolucionTotal && totalOriginal > 0) {
      await client.query(
        "UPDATE entradas SET estado = 'devuelta' WHERE id = $1",
        [entrada_id]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      notaCredito: {
        id: notaCredito.id,
        fecha: notaCredito.fecha,
        total: notaCredito.total,
        lineas_devueltas: lineas.length
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creando nota de crédito:", error);
    return NextResponse.json({ error: "Error al crear la devolución" }, { status: 500 });
  } finally {
    client.release();
  }
}
