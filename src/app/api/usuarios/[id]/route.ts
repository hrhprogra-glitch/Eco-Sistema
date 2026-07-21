import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Usuario } from "@/components/usuarios/types";

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
  const { username, nombre_completo, password, permisos } = body as {
    username?: string;
    nombre_completo?: string | null;
    password?: string;
    permisos?: string[];
  };

  if (!username?.trim()) {
    return NextResponse.json({ error: "El nombre de usuario es requerido." }, { status: 400 });
  }

  try {
    // Si viene el arreglo 'permisos', actualizamos. Si no viene (undefined),
    // lo mantenemos igual usando COALESCE o no enviándolo. La forma más fácil es
    // manejarlo dinámicamente o usar COALESCE($5, permisos).
    // Si no enviamos permisos en la creación normal de usuario, no queremos borrar los existentes.
    // Pasaremos el arreglo o undefined.
    
    // La contraseña solo se toca si vino una nueva en el body: en edición normal
    // (sin campo "nueva contraseña" completado) el hash existente queda intacto.
    const result = password
      ? await query<Usuario>(
          `UPDATE usuarios
           SET username = $1, nombre_completo = $2, password_hash = $3, password_plain = $4,
               permisos = COALESCE($6, permisos), updated_at = now()
           WHERE id = $5
           RETURNING id, username, nombre_completo, permisos, password_plain, created_at, updated_at`,
          [username.trim(), nombre_completo || null, await bcrypt.hash(password, 10), password, id, permisos]
        )
      : await query<Usuario>(
          `UPDATE usuarios
           SET username = $1, nombre_completo = $2, 
               permisos = COALESCE($4, permisos), updated_at = now()
           WHERE id = $3
           RETURNING id, username, nombre_completo, permisos, password_plain, created_at, updated_at`,
          [username.trim(), nombre_completo || null, id, permisos]
        );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err: unknown) {
    const message =
      err instanceof Error && "code" in err && (err as { code?: string }).code === "23505"
        ? "Ya existe un usuario con ese nombre de usuario."
        : "Error al actualizar el usuario.";
    return NextResponse.json({ error: message }, { status: 400 });
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
  const result = await query("DELETE FROM usuarios WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
