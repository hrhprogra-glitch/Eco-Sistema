import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Contacto } from "@/components/contacto/types";

const SELECT_COLUMNS = `
  id, nombre, tipo, es_empresa AS "esEmpresa", email, telefono,
  sitio_web AS "sitioWeb", puesto_trabajo AS "puestoTrabajo", direccion,
  identificaciones, etiquetas, contactos_relacionados AS "contactosRelacionados",
  notas, created_at
`;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await query<Contacto>(
    `SELECT ${SELECT_COLUMNS} FROM contactos ORDER BY created_at DESC`
  );
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const {
    nombre,
    tipo,
    esEmpresa,
    email,
    telefono,
    sitioWeb,
    puestoTrabajo,
    direccion,
    identificaciones,
    etiquetas,
    contactosRelacionados,
    notas,
  } = body as Omit<Contacto, "id" | "created_at">;

  const result = await query<Contacto>(
    `INSERT INTO contactos (
       nombre, tipo, es_empresa, email, telefono, sitio_web, puesto_trabajo,
       direccion, identificaciones, etiquetas, contactos_relacionados, notas
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING ${SELECT_COLUMNS}`,
    [
      nombre,
      tipo,
      esEmpresa,
      email,
      telefono,
      sitioWeb,
      puestoTrabajo,
      JSON.stringify(direccion),
      JSON.stringify(identificaciones),
      JSON.stringify(etiquetas),
      JSON.stringify(contactosRelacionados),
      notas,
    ]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}
