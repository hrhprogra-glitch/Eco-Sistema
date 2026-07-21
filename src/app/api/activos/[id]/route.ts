import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await query("SELECT * FROM activos WHERE id = $1", [id]);
    if (result.rows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tipo, nombre, identificador, estado, fecha_adquisicion, asignado_a, notas, tipo_vehiculo, soat_vencimiento } = body;

    const result = await query(
      `UPDATE activos
       SET tipo = $1, nombre = $2, identificador = $3, estado = $4, fecha_adquisicion = $5, asignado_a = $6, notas = $7,
           tipo_vehiculo = $8, soat_vencimiento = $9, updated_at = now()
       WHERE id = $10 RETURNING *`,
      [
        tipo,
        nombre,
        identificador || null,
        estado,
        fecha_adquisicion || null,
        asignado_a || null,
        notas || null,
        tipo === 'vehiculo' ? tipo_vehiculo || null : null,
        tipo === 'vehiculo' ? soat_vencimiento || null : null,
        id,
      ]
    );
    
    if (result.rows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await query("DELETE FROM activos WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
