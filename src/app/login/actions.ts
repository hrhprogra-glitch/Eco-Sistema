"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

export type LoginState = {
  error?: string;
};

type UsuarioRow = {
  id: number;
  username: string;
  password_hash: string;
};

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!username || !password) {
    return { error: "Ingresa usuario y contraseña." };
  }

  const result = await query<UsuarioRow>(
    "SELECT id, username, password_hash FROM usuarios WHERE username = $1",
    [username]
  );

  const user = result.rows[0];
  if (!user) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  const token = await createSessionToken({ sub: String(user.id), username: user.username });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(next.startsWith("/") ? next : "/");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
