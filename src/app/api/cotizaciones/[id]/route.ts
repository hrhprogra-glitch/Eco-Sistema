import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const result = await query("SELECT * FROM cotizaciones WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { contacto_id, estado, total, fecha, notas, lineas_detalle, moneda, lineas_modo, lineas_libres } = body;

  const updateFields: string[] = [];
  const values: unknown[] = [];

  if (contacto_id !== undefined) {
    updateFields.push(`contacto_id = $${updateFields.length + 1}`);
    values.push(contacto_id);
  }
  if (estado !== undefined) {
    updateFields.push(`estado = $${updateFields.length + 1}`);
    values.push(estado);
  }
  if (total !== undefined) {
    updateFields.push(`total = $${updateFields.length + 1}`);
    values.push(total);
  }
  if (fecha !== undefined) {
    updateFields.push(`fecha = $${updateFields.length + 1}`);
    values.push(fecha);
  }
  if (notas !== undefined) {
    updateFields.push(`notas = $${updateFields.length + 1}`);
    values.push(notas);
  }
  if (moneda !== undefined) {
    updateFields.push(`moneda = $${updateFields.length + 1}`);
    values.push(moneda);
  }
  if (lineas_detalle !== undefined) {
    updateFields.push(`lineas_detalle = $${updateFields.length + 1}`);
    values.push(JSON.stringify(lineas_detalle));
  }
  if (lineas_modo !== undefined) {
    updateFields.push(`lineas_modo = $${updateFields.length + 1}`);
    values.push(lineas_modo);
  }
  if (lineas_libres !== undefined) {
    updateFields.push(`lineas_libres = $${updateFields.length + 1}`);
    values.push(lineas_libres ? JSON.stringify(lineas_libres) : null);
  }

  if (updateFields.length === 0) {
    return NextResponse.json({ success: true });
  }

  try {
    const queryStr = `UPDATE cotizaciones SET ${updateFields.join(", ")} WHERE id = $${updateFields.length + 1}`;
    values.push(id);
    await query(queryStr, values);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating cotizacion:", error);
    return NextResponse.json({ error: "Error al actualizar la cotización" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await query("DELETE FROM cotizaciones WHERE id = $1", [id]);
  return NextResponse.json({ success: true });
}
