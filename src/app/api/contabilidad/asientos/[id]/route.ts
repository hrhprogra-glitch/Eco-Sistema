import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import type { AsientoLinea } from "@/components/contabilidad/types";

const SELECT_ONE = `
  SELECT a.*,
    COALESCE(
      json_agg(
        json_build_object(
          'id', l.id, 'asiento_id', l.asiento_id, 'cuenta_id', l.cuenta_id,
          'debe', l.debe, 'haber', l.haber, 'descripcion', l.descripcion,
          'created_at', l.created_at,
          'cuenta_codigo', c.codigo, 'cuenta_nombre', c.nombre
        ) ORDER BY l.id
      ) FILTER (WHERE l.id IS NOT NULL), '[]'
    ) AS lineas
  FROM asientos_contables a
  LEFT JOIN asiento_lineas l ON l.asiento_id = a.id
  LEFT JOIN plan_cuentas c ON c.id = l.cuenta_id
  WHERE a.id = $1
  GROUP BY a.id
`;

function validarLineas(lineas: { cuenta_id: string; debe: number; haber: number }[]) {
  if (!lineas || lineas.length < 2) {
    return "Un asiento necesita al menos dos líneas";
  }
  for (const l of lineas) {
    if (!l.cuenta_id) return "Cada línea necesita una cuenta";
    if ((l.debe > 0 && l.haber > 0) || (l.debe === 0 && l.haber === 0)) {
      return "Cada línea debe tener un monto en Debe o en Haber, no ambos ni ninguno";
    }
  }
  const totalDebe = lineas.reduce((sum, l) => sum + Number(l.debe), 0);
  const totalHaber = lineas.reduce((sum, l) => sum + Number(l.haber), 0);
  if (Math.abs(totalDebe - totalHaber) > 0.001) {
    return `El asiento no cuadra: Debe ${totalDebe.toFixed(2)} ≠ Haber ${totalHaber.toFixed(2)}`;
  }
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const result = await pool.query(SELECT_ONE, [id]);
  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Asiento no encontrado" }, { status: 404 });
  }
  return NextResponse.json(result.rows[0]);
}

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
  const { fecha, descripcion, lineas, estado } = body as {
    fecha?: string;
    descripcion?: string;
    lineas?: Pick<AsientoLinea, "cuenta_id" | "debe" | "haber" | "descripcion">[];
    estado?: "borrador" | "confirmado";
  };

  const current = await pool.query(`SELECT estado FROM asientos_contables WHERE id = $1`, [id]);
  if (current.rowCount === 0) {
    return NextResponse.json({ error: "Asiento no encontrado" }, { status: 404 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Full edit of fecha/descripcion/lineas is only allowed while the entry is still a draft.
    if (lineas) {
      if (current.rows[0].estado !== "borrador") {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "Solo se pueden editar las líneas de un asiento en borrador" },
          { status: 409 }
        );
      }
      const error = validarLineas(lineas);
      if (error) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error }, { status: 400 });
      }

      await client.query(
        `UPDATE asientos_contables SET fecha = COALESCE($1, fecha), descripcion = COALESCE($2, descripcion) WHERE id = $3`,
        [fecha || null, descripcion?.trim() || null, id]
      );
      await client.query(`DELETE FROM asiento_lineas WHERE asiento_id = $1`, [id]);
      for (const l of lineas) {
        await client.query(
          `INSERT INTO asiento_lineas (asiento_id, cuenta_id, debe, haber, descripcion)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, l.cuenta_id, l.debe || 0, l.haber || 0, l.descripcion?.trim() || null]
        );
      }
    }

    if (estado) {
      await client.query(`UPDATE asientos_contables SET estado = $1 WHERE id = $2`, [estado, id]);
    }

    await client.query("COMMIT");
    const full = await pool.query(SELECT_ONE, [id]);
    return NextResponse.json(full.rows[0]);
  } catch (err: any) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    client.release();
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
  const current = await pool.query(`SELECT estado FROM asientos_contables WHERE id = $1`, [id]);
  if (current.rowCount === 0) {
    return NextResponse.json({ error: "Asiento no encontrado" }, { status: 404 });
  }
  if (current.rows[0].estado !== "borrador") {
    return NextResponse.json(
      { error: "No se puede eliminar un asiento confirmado" },
      { status: 409 }
    );
  }

  await pool.query(`DELETE FROM asientos_contables WHERE id = $1`, [id]);
  return NextResponse.json({ success: true });
}
