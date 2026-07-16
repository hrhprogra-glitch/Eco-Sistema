import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await query(
    `SELECT c.*, ct.nombre as contacto_nombre
     FROM cotizaciones c
     LEFT JOIN contactos ct ON c.contacto_id = ct.id
     ORDER BY c.created_at DESC`
  );

  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { contacto_id, estado, total, fecha, notas, lineas_detalle, moneda, lineas_modo, lineas_libres } = body;

  try {
    const result = await query(
      `INSERT INTO cotizaciones (contacto_id, estado, total, fecha, notas, moneda, lineas_detalle, lineas_modo, lineas_libres)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        contacto_id,
        estado || "borrador",
        total,
        fecha || new Date().toISOString().split("T")[0],
        notas,
        moneda || "PEN",
        JSON.stringify(lineas_detalle || []),
        lineas_modo || "tarjetas",
        lineas_libres ? JSON.stringify(lineas_libres) : null,
      ]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating cotizacion:", error);
    return NextResponse.json({ error: "Error al crear la cotización" }, { status: 500 });
  }
}
