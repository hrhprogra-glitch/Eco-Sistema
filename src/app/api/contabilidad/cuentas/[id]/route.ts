import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { CuentaContable } from "@/components/contabilidad/types";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { codigo, nombre, tipo } = body as Pick<CuentaContable, "codigo" | "nombre" | "tipo">;

  if (!codigo?.trim() || !nombre?.trim() || !tipo) {
    return NextResponse.json({ error: "Código, nombre y tipo son obligatorios" }, { status: 400 });
  }

  try {
    const result = await query<CuentaContable>(
      `UPDATE plan_cuentas SET codigo = $1, nombre = $2, tipo = $3 WHERE id = $4 RETURNING *`,
      [codigo.trim(), nombre.trim(), tipo, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      return NextResponse.json({ error: "Ya existe una cuenta con ese código" }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
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

  try {
    const result = await query(`DELETE FROM plan_cuentas WHERE id = $1 RETURNING *`, [id]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "23503") {
      return NextResponse.json(
        { error: "No se puede eliminar: la cuenta tiene asientos contables registrados" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
