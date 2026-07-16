import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

// Solo lectura: almacenes no tiene sesión de gestión propia todavía (una sola fila
// sembrada por la migración), esto es solo para poblar los <select> de Entradas/Salidas.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await query("SELECT * FROM almacenes ORDER BY nombre ASC");
  return NextResponse.json(result.rows);
}
