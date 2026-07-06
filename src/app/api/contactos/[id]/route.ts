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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
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
    `UPDATE contactos SET
       nombre = $1, tipo = $2, es_empresa = $3, email = $4, telefono = $5,
       sitio_web = $6, puesto_trabajo = $7, direccion = $8, identificaciones = $9,
       etiquetas = $10, contactos_relacionados = $11, notas = $12
     WHERE id = $13
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
      id,
    ]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}
