import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await query("SELECT * FROM mantenimientos_activos WHERE id = $1", [id]);
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
    const { activo_id, tipo_mantenimiento, fecha_programada, fecha_realizada, costo, descripcion, estado } = body;
    
    const result = await query(
      `UPDATE mantenimientos_activos 
       SET activo_id = $1, tipo_mantenimiento = $2, fecha_programada = $3, fecha_realizada = $4, costo = $5, descripcion = $6, estado = $7
       WHERE id = $8 RETURNING *`,
      [activo_id, tipo_mantenimiento, fecha_programada || null, fecha_realizada || null, costo || null, descripcion || null, estado, id]
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
    const result = await query("DELETE FROM mantenimientos_activos WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
