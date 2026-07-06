import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Get all projects with their employees
  const proyectosResult = await query(`
    SELECT p.*, 
      COALESCE(
        json_agg(
          json_build_object('id', e.id, 'nombre', e.nombre, 'foto_url', e.foto_url)
        ) FILTER (WHERE e.id IS NOT NULL),
        '[]'
      ) as empleados
    FROM proyectos p
    LEFT JOIN proyecto_empleados pe ON p.id = pe.proyecto_id
    LEFT JOIN empleados e ON pe.empleado_id = e.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `);

  return NextResponse.json(proyectosResult.rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { nombre, empleados, items } = body as {
    nombre: string;
    empleados?: number[];
    items?: {
      producto_id: number | null;
      nombre_externo: string | null;
      cantidad: number;
      justificacion: string | null;
    }[];
  };

  try {
    // 1. Create project
    const pResult = await query(
      `INSERT INTO proyectos (nombre) VALUES ($1) RETURNING *`,
      [nombre]
    );
    const newProject = pResult.rows[0];

    // 2. Assign employees
    if (empleados && empleados.length > 0) {
      for (const empId of empleados) {
        await query(
          `INSERT INTO proyecto_empleados (proyecto_id, empleado_id) VALUES ($1, $2)`,
          [newProject.id, empId]
        );
      }
    }

    // 3. Add materials and deduct inventory
    if (items && items.length > 0) {
      for (const item of items) {
        await query(
          `INSERT INTO proyecto_items (proyecto_id, producto_id, nombre_externo, cantidad, justificacion)
           VALUES ($1, $2, $3, $4, $5)`,
          [newProject.id, item.producto_id || null, item.nombre_externo || null, item.cantidad, item.justificacion || null]
        );

        if (item.producto_id) {
          await query(`UPDATE productos SET stock = stock - $1 WHERE id = $2`, [
            item.cantidad,
            item.producto_id,
          ]);
        }
      }
    }

    return NextResponse.json(newProject);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
