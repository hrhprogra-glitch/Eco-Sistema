import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo");

    let sql = `
      SELECT a.*,
        (SELECT MIN(m.fecha_programada) FROM mantenimientos_activos m
         WHERE m.activo_id = a.id AND m.estado = 'pendiente' AND m.fecha_programada IS NOT NULL
        ) AS proximo_mantenimiento
      FROM activos a
    `;
    const params: any[] = [];

    if (tipo) {
      sql += " WHERE a.tipo = $1";
      params.push(tipo);
    }

    sql += " ORDER BY a.created_at DESC";
    
    const result = await query(sql, params);
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tipo, nombre, identificador, estado, fecha_adquisicion, asignado_a, notas, tipo_vehiculo, soat_vencimiento } = body;

    const result = await query(
      `INSERT INTO activos (tipo, nombre, identificador, estado, fecha_adquisicion, asignado_a, notas, tipo_vehiculo, soat_vencimiento)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        tipo,
        nombre,
        identificador || null,
        estado || 'disponible',
        fecha_adquisicion || null,
        asignado_a || null,
        notas || null,
        tipo === 'vehiculo' ? tipo_vehiculo || null : null,
        tipo === 'vehiculo' ? soat_vencimiento || null : null,
      ]
    );
    
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
