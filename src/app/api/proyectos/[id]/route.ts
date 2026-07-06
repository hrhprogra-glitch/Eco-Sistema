import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  // Get project items
  const itemsResult = await query(`
    SELECT pi.*, 
           pr.nombre as producto_nombre, 
           pr.foto_url as producto_foto
    FROM proyecto_items pi
    LEFT JOIN productos pr ON pi.producto_id = pr.id
    WHERE pi.proyecto_id = $1
    ORDER BY pi.created_at DESC
  `, [id]);

  // Get project employees
  const empResult = await query(`
    SELECT e.id, e.nombre, e.foto_url
    FROM proyecto_empleados pe
    JOIN empleados e ON pe.empleado_id = e.id
    WHERE pe.proyecto_id = $1
  `, [id]);

  const projResult = await query(`SELECT * FROM proyectos WHERE id = $1`, [id]);

  if (projResult.rowCount === 0) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const project = projResult.rows[0];
  project.empleados = empResult.rows;
  project.items = itemsResult.rows;

  return NextResponse.json(project);
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
  await query(`DELETE FROM proyectos WHERE id = $1`, [id]);

  return NextResponse.json({ success: true });
}
