import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Usuario } from "@/components/usuarios/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // password_hash NUNCA se incluye en el SELECT: esta lista es la única puerta
  // de entrada del cliente a la tabla `usuarios` y no debe filtrar el hash.
  const result = await query<Usuario>(
    "SELECT id, username, nombre_completo, created_at, updated_at FROM usuarios ORDER BY username ASC"
  );
  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { username, password, nombre_completo } = body as {
    username?: string;
    password?: string;
    nombre_completo?: string | null;
  };

  if (!username?.trim() || !password) {
    return NextResponse.json(
      { error: "Usuario y contraseña son requeridos." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await query<Usuario>(
      `INSERT INTO usuarios (username, password_hash, nombre_completo)
       VALUES ($1, $2, $3)
       RETURNING id, username, nombre_completo, created_at, updated_at`,
      [username.trim(), passwordHash, nombre_completo || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error && "code" in err && (err as { code?: string }).code === "23505"
        ? "Ya existe un usuario con ese nombre de usuario."
        : "Error al crear el usuario.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
