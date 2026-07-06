import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Producto } from "@/components/inventario/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const {
    nombre,
    sku,
    stock,
    precio,
    favorito,
    foto_url,
    limite_stock,
    tipo,
    rastrear_inventario,
    unidad,
    impuesto_venta,
    codigo_detraccion,
    costo,
    categoria,
    referencia,
    codigo_barras,
    notas_internas,
  } = body as Omit<Producto, "id" | "created_at">;

  const result = await query<Producto>(
    `UPDATE productos SET
       nombre = $1, sku = $2, stock = $3, precio = $4, favorito = $5, foto_url = $6,
       limite_stock = $7, tipo = $8, rastrear_inventario = $9,
       unidad = $10, impuesto_venta = $11, codigo_detraccion = $12, costo = $13,
       categoria = $14, referencia = $15, codigo_barras = $16, notas_internas = $17
     WHERE id = $18
     RETURNING *`,
    [
      nombre,
      sku,
      stock,
      precio,
      favorito,
      foto_url,
      limite_stock,
      tipo,
      rastrear_inventario,
      unidad,
      impuesto_venta,
      codigo_detraccion,
      costo,
      categoria,
      referencia,
      codigo_barras,
      notas_internas,
      id,
    ]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const result = await query(
    `DELETE FROM productos WHERE id = $1 RETURNING *`,
    [id]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
