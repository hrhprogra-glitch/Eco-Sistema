import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Contacto } from "@/components/contacto/types";

const SELECT_COLUMNS = `
  id, nombre, tipo, es_empresa AS "esEmpresa", email, telefono,
  sitio_web AS "sitioWeb", puesto_trabajo AS "puestoTrabajo",
  codigo, nombre_fiscal AS "nombreFiscal", fax, movil,
  persona_contacto AS "personaContacto", nif, agente,
  tipo_cliente AS "tipoCliente", ubicacion_url AS "ubicacionUrl",
  direccion, identificaciones, etiquetas, contactos_relacionados AS "contactosRelacionados",
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
    codigo,
    nombreFiscal,
    fax,
    movil,
    personaContacto,
    nif,
    agente,
    tipoCliente,
    ubicacionUrl,
    direccion,
    identificaciones,
    etiquetas,
    contactosRelacionados,
    notas,
  } = body as Omit<Contacto, "id" | "created_at">;

  const result = await query<Contacto>(
    `UPDATE contactos SET
       nombre = $1, tipo = $2, es_empresa = $3, email = $4, telefono = $5,
       sitio_web = $6, puesto_trabajo = $7, codigo = $8, nombre_fiscal = $9,
       fax = $10, movil = $11, persona_contacto = $12, nif = $13, agente = $14,
       tipo_cliente = $15, ubicacion_url = $16, direccion = $17, identificaciones = $18,
       etiquetas = $19, contactos_relacionados = $20, notas = $21
     WHERE id = $22
     RETURNING ${SELECT_COLUMNS}`,
    [
      nombre,
      tipo,
      esEmpresa ?? false,
      email || "",
      telefono || "",
      sitioWeb || "",
      puestoTrabajo || "",
      codigo || null,
      nombreFiscal || null,
      fax || null,
      movil || null,
      personaContacto || null,
      nif || null,
      agente || null,
      tipoCliente || null,
      ubicacionUrl || null,
      JSON.stringify(direccion ?? {}),
      JSON.stringify(identificaciones ?? []),
      JSON.stringify(etiquetas ?? []),
      JSON.stringify(contactosRelacionados ?? []),
      notas || "",
      id,
    ]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
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
  const result = await query(`DELETE FROM contactos WHERE id = $1 RETURNING id`, [id]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
