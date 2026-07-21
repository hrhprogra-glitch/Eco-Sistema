import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activo_id = searchParams.get("activo_id");
    
    let sql = `
      SELECT m.*, a.nombre as activo_nombre, a.tipo as activo_tipo
      FROM mantenimientos_activos m
      JOIN activos a ON m.activo_id = a.id
    `;
    const params: any[] = [];
    
    if (activo_id) {
      sql += " WHERE m.activo_id = $1";
      params.push(activo_id);
    }
    
    sql += " ORDER BY m.fecha_programada ASC NULLS LAST, m.created_at DESC";
    
    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { activo_id, tipo_mantenimiento, fecha_programada, fecha_realizada, costo, descripcion, estado } = body;
    
    const result = await query(
      `INSERT INTO mantenimientos_activos 
       (activo_id, tipo_mantenimiento, fecha_programada, fecha_realizada, costo, descripcion, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [activo_id, tipo_mantenimiento, fecha_programada || null, fecha_realizada || null, costo || null, descripcion || null, estado || 'pendiente']
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
