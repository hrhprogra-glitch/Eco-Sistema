import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { pool } from "@/lib/db";
import type { AsientoContable, AsientoLinea } from "@/components/contabilidad/types";

const SELECT_ASIENTOS = `
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
  GROUP BY a.id
  ORDER BY a.fecha DESC, a.id DESC
`;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await pool.query<AsientoContable>(SELECT_ASIENTOS);
  return NextResponse.json(result.rows);
}

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

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { fecha, descripcion, lineas } = body as {
    fecha: string;
    descripcion: string;
    lineas: Pick<AsientoLinea, "cuenta_id" | "debe" | "haber" | "descripcion">[];
  };

  if (!fecha || !descripcion?.trim()) {
    return NextResponse.json({ error: "Fecha y descripción son obligatorias" }, { status: 400 });
  }

  const error = validarLineas(lineas);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const asientoResult = await client.query(
      `INSERT INTO asientos_contables (fecha, descripcion) VALUES ($1, $2) RETURNING *`,
      [fecha, descripcion.trim()]
    );
    const asiento = asientoResult.rows[0];

    for (const l of lineas) {
      await client.query(
        `INSERT INTO asiento_lineas (asiento_id, cuenta_id, debe, haber, descripcion)
         VALUES ($1, $2, $3, $4, $5)`,
        [asiento.id, l.cuenta_id, l.debe || 0, l.haber || 0, l.descripcion?.trim() || null]
      );
    }

    await client.query("COMMIT");

    const full = await pool.query(`${SELECT_ASIENTOS.replace("GROUP BY a.id", "WHERE a.id = $1 GROUP BY a.id")}`, [asiento.id]);
    return NextResponse.json(full.rows[0]);
  } catch (err: any) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    client.release();
  }
}
