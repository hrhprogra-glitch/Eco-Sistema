import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Producto } from "@/components/inventario/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await query<Producto>(
    "SELECT * FROM productos ORDER BY created_at DESC"
  );
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

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
    `INSERT INTO productos (
       nombre, sku, stock, precio, favorito, foto_url, limite_stock,
       tipo, rastrear_inventario, unidad, impuesto_venta, codigo_detraccion,
       costo, categoria, referencia, codigo_barras, notas_internas
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
    ]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}
