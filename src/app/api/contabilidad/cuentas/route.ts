import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { CuentaContable } from "@/components/contabilidad/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await query<CuentaContable>(
    `SELECT * FROM plan_cuentas ORDER BY codigo`
  );
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { codigo, nombre, tipo } = body as Pick<CuentaContable, "codigo" | "nombre" | "tipo">;

  if (!codigo?.trim() || !nombre?.trim() || !tipo) {
    return NextResponse.json({ error: "Código, nombre y tipo son obligatorios" }, { status: 400 });
  }

  try {
    const result = await query<CuentaContable>(
      `INSERT INTO plan_cuentas (codigo, nombre, tipo) VALUES ($1, $2, $3) RETURNING *`,
      [codigo.trim(), nombre.trim(), tipo]
    );
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      return NextResponse.json({ error: "Ya existe una cuenta con ese código" }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
