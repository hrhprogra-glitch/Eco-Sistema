import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { PiscinaMaterial, PiscinaMaterialInput } from "@/components/piscina/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const result = await query<PiscinaMaterial>(
    `SELECT id, piscina_id, nombre_material, cantidad, monto, fecha, notas, created_at
     FROM piscina_materiales WHERE piscina_id = $1 ORDER BY fecha DESC, created_at DESC`,
    [id]
  );
  return NextResponse.json(result.rows);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { nombre_material, cantidad, monto, fecha, notas } = body as PiscinaMaterialInput;

  const inserted = await query<PiscinaMaterial>(
    `INSERT INTO piscina_materiales (piscina_id, nombre_material, cantidad, monto, fecha, notas)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, piscina_id, nombre_material, cantidad, monto, fecha, notas, created_at`,
    [id, nombre_material, cantidad, monto, fecha, notas ?? ""]
  );

  return NextResponse.json(inserted.rows[0], { status: 201 });
}
