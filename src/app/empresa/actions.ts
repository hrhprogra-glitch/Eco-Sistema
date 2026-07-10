"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { EMPRESA_COOKIE, type EmpresaActual } from "./types";

async function guardarEmpresa(nombre: string) {
  const empresa: EmpresaActual = { nombre, creadaEn: new Date().toISOString() };
  (await cookies()).set(EMPRESA_COOKIE, JSON.stringify(empresa), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function crearEmpresa(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim() || "Mi Empresa";
  await guardarEmpresa(nombre);
  redirect("/empresa");
}

export async function usarDatosDePrueba() {
  await guardarEmpresa("Empresa de prueba");
  redirect("/empresa");
}

export async function entrarAEmpresa() {
  redirect("/");
}
