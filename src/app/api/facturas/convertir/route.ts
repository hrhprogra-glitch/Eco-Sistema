import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import type { LineaItem } from "@/components/ui/LineaItemsEditor";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { cotizacion_id } = body;
  if (!cotizacion_id) {
    return NextResponse.json({ error: "Falta cotizacion_id" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const cotizacionRes = await client.query("SELECT * FROM cotizaciones WHERE id = $1", [cotizacion_id]);
    if (cotizacionRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
    }
    const cotizacion = cotizacionRes.rows[0];

    const yaConvertidaRes = await client.query("SELECT id FROM facturas WHERE cotizacion_id = $1", [cotizacion_id]);
    if (yaConvertidaRes.rows.length > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Esta cotización ya tiene una factura asociada." }, { status: 409 });
    }

    const facturaRes = await client.query(
      `INSERT INTO facturas (contacto_id, cotizacion_id, estado, total, fecha, notas)
       VALUES ($1, $2, 'borrador', $3, CURRENT_DATE, $4) RETURNING *`,
      [cotizacion.contacto_id, cotizacion_id, cotizacion.total, cotizacion.notas]
    );
    const facturaId = facturaRes.rows[0].id;

    // La cotización guarda sus líneas como tarjetas en lineas_detalle (JSONB); acá se
    // aplanan a filas de factura_lineas, que sigue siendo una tabla normalizada simple.
    const idsProductos = new Set<string>();
    const cartas: LineaItem[] = cotizacion.lineas_detalle || [];
    for (const carta of cartas) {
      if (carta.tipo === "producto") {
        for (const p of carta.productos) {
          if (p.producto_id) idsProductos.add(p.producto_id);
        }
      }
    }
    const nombresRes = idsProductos.size > 0
      ? await client.query("SELECT id, nombre FROM productos WHERE id = ANY($1)", [Array.from(idsProductos)])
      : { rows: [] as { id: string; nombre: string }[] };
    const nombrePorId = new Map(nombresRes.rows.map((r) => [r.id, r.nombre]));

    const filas: { producto_id: string | null; descripcion: string | null; cantidad: number; precio_unitario: number; subtotal: number }[] = [];
    for (const carta of cartas) {
      if (carta.tipo === "descripcion") {
        filas.push({ producto_id: null, descripcion: carta.descripcion, cantidad: 1, precio_unitario: carta.precio, subtotal: carta.precio });
        continue;
      }
      if (carta.precio_general) {
        const nombres = carta.productos
          .map((p) => (p.producto_id ? nombrePorId.get(p.producto_id) : p.descripcion))
          .filter(Boolean);
        const descripcion = [carta.descripcion_superior, ...nombres].filter(Boolean).join(" - ") || null;
        filas.push({ producto_id: null, descripcion, cantidad: 1, precio_unitario: carta.precio_general, subtotal: carta.precio_general });
        continue;
      }
      for (const p of carta.productos) {
        filas.push({
          producto_id: p.producto_id ?? null,
          descripcion: p.producto_id ? nombrePorId.get(p.producto_id) ?? p.descripcion ?? null : p.descripcion ?? null,
          cantidad: p.cantidad,
          precio_unitario: p.precio_unitario,
          subtotal: p.cantidad * p.precio_unitario,
        });
      }
    }

    for (const fila of filas) {
      await client.query(
        `INSERT INTO factura_lineas (factura_id, producto_id, descripcion, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [facturaId, fila.producto_id, fila.descripcion, fila.cantidad, fila.precio_unitario, fila.subtotal]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json(facturaRes.rows[0], { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error convirtiendo cotización en factura:", error);
    return NextResponse.json({ error: "Error al convertir la cotización" }, { status: 500 });
  } finally {
    client.release();
  }
}
