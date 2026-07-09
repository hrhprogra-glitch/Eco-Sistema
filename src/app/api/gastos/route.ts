import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Gasto } from "@/components/gastos/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await query<Gasto>(
    "SELECT * FROM gastos ORDER BY fecha DESC, created_at DESC"
  );
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { concepto, categoria, monto, fecha, estado, notas, comprobante_url } =
    body as Omit<Gasto, "id" | "created_at">;

  const result = await query<Gasto>(
    `INSERT INTO gastos (concepto, categoria, monto, fecha, estado, notas, comprobante_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [concepto, categoria, monto, fecha, estado, notas || null, comprobante_url || null]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}
